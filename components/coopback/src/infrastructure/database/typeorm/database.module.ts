// infrastructure/database/database.module.ts

import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import path from 'path';
import config from '~/config/config';
import { APP_REPOSITORY } from '~/domain/appstore/repositories/extension-domain.repository.interface';
import { TypeOrmAppStoreDomainRepository } from './repositories/typeorm-app.repository';
import { ExtensionEntity } from './entities/extension.entity';

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
    TypeOrmModule.forFeature([ExtensionEntity]), // Регистрируем сущность для использования в репозитории
  ],
  providers: [
    {
      provide: APP_REPOSITORY, // Ключ для инжекции
      useClass: TypeOrmAppStoreDomainRepository, // Реализация репозитория
    },
  ],
  exports: [TypeOrmModule, APP_REPOSITORY], // Экспортируем TypeOrmModule для использования в других модулях
})
export class DatabaseModule {}
