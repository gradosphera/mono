// app.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import config from './config/config';
import { DatabaseModule } from './infrastructure/database/database.module';
import { GraphqlModule } from './infrastructure/graphql/graphql.module';
import { BlockchainModule } from './infrastructure/blockchain/blockchain.module';
import { DomainModule } from './domain/domain.module';
import { ApplicationModule } from './modules/application.module';
import { InfrastructureModule } from './infrastructure/infrastructure.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Чтобы .env был доступен глобально
    }),
    DomainModule,
    ApplicationModule,
    InfrastructureModule,
  ],
  providers: [],
  exports: [],
})
export class AppModule {}
