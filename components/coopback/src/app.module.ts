// app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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
