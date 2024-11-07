import { Module } from '@nestjs/common';
import { AppStoreController } from './controllers/appstore-app.controller';
import { AppManagementService } from './services/appstore-app.service';
import { ExtensionDomainModule } from '~/domain/extension/extension-domain.module';
import { AppStoreResolver } from './resolvers/extension.resolver';

@Module({
  imports: [
    ExtensionDomainModule, // Импортируем доменный модуль
  ],
  controllers: [AppStoreController],
  providers: [AppManagementService, AppStoreResolver],
  exports: [AppManagementService],
})
export class AppStoreModule {}
