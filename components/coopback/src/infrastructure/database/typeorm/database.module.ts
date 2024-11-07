// infrastructure/database/database.module.ts

import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import path from 'path';
import config from '~/config/config';
import { EXTENSION_REPOSITORY } from '~/domain/extension/repositories/extension-domain.repository.interface';
import { TypeOrmExtensionDomainRepository } from './repositories/typeorm-extension.repository';
import { ExtensionEntity } from './entities/extension.entity';
import { LogExtensionEntity } from './entities/log-extension.entity';
import { LOG_EXTENSION_REPOSITORY } from '~/domain/extension/repositories/log-extension-domain.repository.interface';
import { TypeOrmLogExtensionDomainRepository } from './repositories/typeorm-log-extension.repository';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRoot({
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
    TypeOrmModule.forFeature([ExtensionEntity, LogExtensionEntity]), // Регистрируем сущность для использования в репозитории
  ],
  providers: [
    {
      provide: EXTENSION_REPOSITORY, // Ключ для инжекции
      useClass: TypeOrmExtensionDomainRepository, // Реализация репозитория
    },
    {
      provide: LOG_EXTENSION_REPOSITORY, // Ключ для инжекции
      useClass: TypeOrmLogExtensionDomainRepository, // Реализация репозитория
    },
  ],
  exports: [TypeOrmModule, EXTENSION_REPOSITORY, LOG_EXTENSION_REPOSITORY], // Экспортируем TypeOrmModule для использования в других модулях
})
export class DatabaseModule {}
