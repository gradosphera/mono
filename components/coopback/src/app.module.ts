// app.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import * as glob from 'glob';
import * as path from 'path';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import config from './config/config';
import { PaymentModule } from './domain/payment/payment.module';
import { ProviderModule } from './domain/provider/provider.module';
import { ExtensionDomainModule } from './domain/extension/extension-domain.module';
import { DatabaseModule } from './infrastructure/database/typeorm/database.module';
import { QueueModule } from './modules/queue/queue-app.module';
import { RedisAppModule } from './modules/redis/redis-app.module';
import { LoggerModule } from './modules/logger/logger-app.module';
import { HttpApiExceptionFilter } from './filters/all-exceptions.filter';
import { GraphqlModule } from './infrastructure/graphql/graphql.module';

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
    ConfigModule.forRoot({
      isGlobal: true, // Чтобы .env был доступен глобально
    }),
    ...dynamicImportModules(), // Динамически импортируем все найденные модули
    RedisAppModule,
    PaymentModule,
    ProviderModule,
    ExtensionDomainModule,
    MongooseModule.forRoot(config.mongoose.url),
    DatabaseModule,
    GraphqlModule,
    QueueModule,
    LoggerModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpApiExceptionFilter,
    },
  ],
  exports: [],
})
export class AppModule {}
