import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsHttpFilter } from './shared/filters/all-exceptions-http.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.useGlobalFilters(new AllExceptionsHttpFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') ?? 3000;
  const enableSwagger = configService.get<string>('ENABLE_SWAGGER') === 'true';

  if (enableSwagger) {
    const config = new DocumentBuilder()
      .setTitle('Merchant Transactions')
      .setDescription('Transactions API')
      .setVersion('1.0')
      .addTag('Merchant Transactions')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
  }

  await app.listen(port);
}

bootstrap().catch((e: any) => `error during app boostrap ${e}`);
