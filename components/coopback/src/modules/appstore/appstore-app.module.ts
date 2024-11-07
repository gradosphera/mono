import { Module } from '@nestjs/common';
import { AppStoreController } from './controllers/appstore-app.controller';
import { AppManagementService } from './services/appstore-app.service';
import { ExtensionDomainModule } from '~/domain/extension/extension-domain.module';

@Module({
  imports: [
    ExtensionDomainModule, // Импортируем доменный модуль
  ],
  controllers: [AppStoreController],
  providers: [AppManagementService],
  exports: [AppManagementService],
})
export class AppStoreModule {}
