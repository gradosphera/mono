import { Module } from '@nestjs/common';
import { DesktopService } from './services/desktop.service';
import { DesktopDomainInteractor } from './interactors/desktop.interactor';
import { DesktopResolver } from './resolvers/desktop.resolver';
import { AppStoreModule } from '~/application/appstore/appstore-app.module';

@Module({
  imports: [AppStoreModule],
  controllers: [],
  providers: [DesktopDomainInteractor, DesktopService, DesktopResolver],
  exports: [],
})
export class DesktopModule {}
