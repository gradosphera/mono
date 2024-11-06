// infrastructure/database/database.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import path from 'path';
import config from '~/config/config';

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
  ],
  exports: [TypeOrmModule], // Экспортируем TypeOrmModule для использования в других модулях
})
export class DatabaseModule {}
