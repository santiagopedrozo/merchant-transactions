import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Merchant } from './entities/merchant.entity';

@Injectable()
export class MerchantService {
  constructor(
    @InjectRepository(Merchant)
    private readonly merchantRepository: Repository<Merchant>,
  ) {}

  async findById(id: number): Promise<Merchant | null> {
    return this.merchantRepository.findOne({ where: { id } });
  }

  async create(name: string): Promise<Merchant> {
    const merchant = this.merchantRepository.create({ name });
    return this.merchantRepository.save(merchant);
  }
}
