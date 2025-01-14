// infrastructure/database/typeorm/typeorm.module.ts
import { Global, Module } from '@nestjs/common';
import { TypeOrmModule as NestTypeOrmModule } from '@nestjs/typeorm';
import path from 'path';
import config from '~/config/config';
import { EXTENSION_REPOSITORY } from '~/domain/extension/repositories/extension-domain.repository';
import { TypeOrmExtensionDomainRepository } from './repositories/typeorm-extension.repository';
import { ExtensionEntity } from './entities/extension.entity';
import { LogExtensionEntity } from './entities/log-extension.entity';
import { LOG_EXTENSION_REPOSITORY } from '~/domain/extension/repositories/log-extension-domain.repository';
import { TypeOrmLogExtensionDomainRepository } from './repositories/typeorm-log-extension.repository';

@Global()
@Module({
  imports: [
    NestTypeOrmModule.forRoot({
      type: 'postgres',
      host: config.postgres.host,
      port: Number(config.postgres.port),
      username: config.postgres.username,
      password: config.postgres.password,
      database: config.postgres.database,
      entities: [path.join(__dirname, '**/entities/*.entity.{ts,js}')],
      migrations: ['migrations/*.ts'],
      synchronize: true, // Отключите в продакшене
      logging: false,
    }),
    NestTypeOrmModule.forFeature([ExtensionEntity, LogExtensionEntity]),
  ],
  providers: [
    {
      provide: EXTENSION_REPOSITORY,
      useClass: TypeOrmExtensionDomainRepository,
    },
    {
      provide: LOG_EXTENSION_REPOSITORY,
      useClass: TypeOrmLogExtensionDomainRepository,
    },
  ],
  exports: [NestTypeOrmModule, EXTENSION_REPOSITORY, LOG_EXTENSION_REPOSITORY],
})
export class TypeOrmModule {}
