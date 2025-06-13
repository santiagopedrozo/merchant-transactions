import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../src/app.module';
import {DataSource, Repository} from 'typeorm';
import {AllExceptionsHttpFilter} from "../../../src/shared/filters/all-exceptions-http.filter";
import {Receivable} from "../../../src/receivables/entities/receivable.entity";
import {getRepositoryToken} from "@nestjs/typeorm";

describe('TransactionController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let receivableRepository: Repository<Receivable>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new AllExceptionsHttpFilter());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    dataSource = moduleFixture.get(DataSource);

    await app.init();

    receivableRepository = moduleFixture.get<Repository<Receivable>>(
        getRepositoryToken(Receivable),
    );
  });

  afterEach(async () => {
    await dataSource.query(`TRUNCATE TABLE "receivables" RESTART IDENTITY CASCADE`);
    await dataSource.query(`TRUNCATE TABLE "transactions" RESTART IDENTITY CASCADE`);
    await dataSource.query(`TRUNCATE TABLE "merchants" RESTART IDENTITY CASCADE`);
    await dataSource.query(`TRUNCATE TABLE "cards" RESTART IDENTITY CASCADE`);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create a CREDIT transaction and verify receivable', async () => {
    await request(app.getHttpServer())
        .post('/merchant')
        .send('tienda nube');

    const payload = {
      merchantId: 1,
      subtotal: 100,
      description: "Credit test",
      method: "CREDIT",
      cardHolderName: "John Doe",
      cardNumber: "343893520252758",
      cardExpirationDate: "12/26",
      cardCvv: 123
    };

    const res = await request(app.getHttpServer())
        .post('/transaction')
        .send(payload)
        .expect(201);

    expect(res.body).toEqual(
        expect.objectContaining({
          value: 96,
          description: 'Credit test',
        }),
    );

    const receivable = await receivableRepository.findOne({
      where: { transactionId: res.body.id },
    });

    if(receivable){
      expect(receivable).toBeDefined();
      expect(receivable.status).toBe('WAITING_FUNDS');

    }
  });

  it('should create a DEBIT transaction and verify receivable with decimals', async () => {
    await request(app.getHttpServer())
        .post('/merchant')
        .send('tienda nube');

    const payload = {
      merchantId: 1,
      subtotal: 215.75,
      description: 'Debit test with decimal',
      method: 'DEBIT',
      cardHolderName: 'Jane Smith',
      cardExpirationDate: '11/25',
      cardNumber: '3438935202527589',
      cardCvv: 456,
    };

    const expectedNetAmount = +(payload.subtotal * 0.98).toFixed(2); // 2% fee
    const res = await request(app.getHttpServer())
        .post('/transaction')
        .send(payload)
        .expect(201);

    expect(res.body.description).toBe('Debit test with decimal');
    expect(Math.abs(res.body.value - expectedNetAmount)).toBeLessThanOrEqual(0.01);

    const receivable = await receivableRepository.findOne({
      where: { transactionId: res.body.id },
    });

    if(receivable){
      expect(receivable).toBeDefined();
      expect(receivable.status).toBe('PAID');
    }
  });

  it('should reject a transaction with an expired card', async () => {
    await request(app.getHttpServer())
        .post('/merchant')
        .send('tienda nube');

    const payload = {
      merchantId: 1,
      subtotal: 150,
      description: 'Expired card test',
      method: 'CREDIT',
      cardHolderName: 'Expired User',
      cardExpirationDate: '01/23',
      cardNumber: '3438935202527589',
      cardCvv: 789,
    };

    const res = await request(app.getHttpServer())
        .post('/transaction')
        .send(payload)
        .expect(400);

    expect(res.body.message).toContain('Card is expired');
  });

});
