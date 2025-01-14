// app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DomainModule } from './domain/domain.module';
import { ApplicationModule } from './modules/application.module';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { ThrottlerModule } from '@nestjs/throttler';

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
  providers: [],
  exports: [],
})
export class AppModule {}
