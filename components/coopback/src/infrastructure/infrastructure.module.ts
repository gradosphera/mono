// app.module.ts
import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { GraphqlModule } from './graphql/graphql.module';
import { MongooseModule } from '@nestjs/mongoose';
import config from '~/config/config';
import { BlockchainModule } from './blockchain/blockchain.module';
import { GeneratorInfrastructureModule } from './generator/generator.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    MongooseModule.forRoot(config.mongoose.url),
    DatabaseModule,
    GraphqlModule,
    BlockchainModule,
    GeneratorInfrastructureModule,
    RedisModule,
  ],
  exports: [
    MongooseModule.forRoot(config.mongoose.url),
    DatabaseModule,
    GraphqlModule,
    BlockchainModule,
    GeneratorInfrastructureModule,
    RedisModule,
  ],
})
export class InfrastructureModule {}
