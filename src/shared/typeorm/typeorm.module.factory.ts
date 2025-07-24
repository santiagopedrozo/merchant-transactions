import {connectionOptions} from './connection-options';
import {TypeOrmModuleOptions} from '@nestjs/typeorm';
import {LoggerForTypeORM} from "./logger/typeorm.logger";

export const getTypeOrmModuleFactory =
    async (): Promise<TypeOrmModuleOptions> => {
        return {
            ...connectionOptions,
            autoLoadEntities: true,
            //logging: 'all'
        };
    };
