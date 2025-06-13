import { connectionOptions } from './connection-options';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const getTypeOrmModuleFactory =
  async (): Promise<TypeOrmModuleOptions> => {
    return {
      ...connectionOptions,
      autoLoadEntities: true,
      logging: 'all',
    };
  };
