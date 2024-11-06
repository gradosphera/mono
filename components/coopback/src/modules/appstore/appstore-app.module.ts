import { Module } from '@nestjs/common';
import { AppStoreController } from './controllers/appstore-app.controller';
import { AppManagementService } from './services/appstore-app.service';
import { AppStoreDomainModule } from '~/domain/appstore/appstore-domain.module';

@Module({
  imports: [
    AppStoreDomainModule, // Импортируем доменный модуль
  ],
  controllers: [AppStoreController],
  providers: [AppManagementService],
  exports: [AppManagementService],
})
export class AppStoreModule {}
