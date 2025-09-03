import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { GraphqlModule } from './graphql/graphql.module';
import { MongooseModule } from '@nestjs/mongoose';
import config from '~/config/config';
import { BlockchainModule } from './blockchain/blockchain.module';
import { GeneratorInfrastructureModule } from './generator/generator.module';
import { RedisModule } from './redis/redis.module';
import { NovuModule } from './novu/novu.module';
import { EventsInfrastructureModule } from './events/events.module';

@Module({
  imports: [
    MongooseModule.forRoot(config.mongoose.url),
    DatabaseModule,
    GraphqlModule,
    BlockchainModule,
    GeneratorInfrastructureModule,
    RedisModule,
    NovuModule,
    EventsInfrastructureModule,
  ],
  exports: [
    MongooseModule.forRoot(config.mongoose.url),
    DatabaseModule,
    GraphqlModule,
    BlockchainModule,
    GeneratorInfrastructureModule,
    RedisModule,
    NovuModule,
    EventsInfrastructureModule,
  ],
})
export class InfrastructureModule {}
