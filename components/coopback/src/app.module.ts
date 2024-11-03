// app.module.ts
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import expressApp from './app'; // путь к вашему Express-приложению
import { MongooseModule } from '@nestjs/mongoose';
import * as glob from 'glob';
import * as path from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule as NestBullModule } from '@nestjs/bull';
import { ConfigModule } from '@nestjs/config';

import config from './config/config';

// Функция для динамического импорта модулей
function dynamicImportModules(): any[] {
  const modules = [] as any[];

  const modulePaths = glob.sync(path.join(__dirname, 'modules/*/*.module.{ts,js}'));

  modulePaths.forEach((modulePath) => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const module = require(modulePath);
    const moduleName = Object.keys(module)[0]; // Получаем имя экспортируемого модуля
    modules.push(module[moduleName]);
  });
  return modules;
}

@Module({
  imports: [
    // Подключение к MongoDB через MongooseModule
    MongooseModule.forRoot(config.mongoose.url),

    ...dynamicImportModules(), // Динамически импортируем все найденные модули
    ConfigModule.forRoot({
      isGlobal: true, // Чтобы .env был доступен глобально
    }),
    NestBullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT as string),
        password: process.env.REDIS_PASSWORD,
      },
    }),
    // TypeOrmModule.forRoot({
    //   type: 'postgres',
    //   host: process.env.PROVIDER_DB_HOST,
    //   port: Number(process.env.PROVIDER_DB_PORT),
    //   username: process.env.PROVIDER_DB_USERNAME,
    //   password: process.env.PROVIDER_DB_PASSWORD,
    //   database: process.env.PROVIDER_DB_DATABASE,
    //   entities: [path.join(__dirname, 'modules/*/entities/*.{ts,js}')],
    //   migrations: ['migrations/*.ts'], // Указываем путь на исходные TS файлы миграций
    //   synchronize: true, //поменять когда-нибудь потом
    //   logging: false,
    // }),
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(expressApp).forRoutes('*'); // Подключаем Express ко всем маршрутам
  }
}
