// app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DomainModule } from './domain/domain.module';
import { ApplicationModule } from './modules/application.module';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { GraphQLDateTime } from 'graphql-scalars';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Чтобы .env был доступен глобально
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 50,
      },
    ]),
    DomainModule,
    ApplicationModule,
    InfrastructureModule,
  ],
  providers: [
    {
      provide: 'DateTime',
      useValue: GraphQLDateTime,
    },
  ],
  exports: [],
})
export class AppModule {}
