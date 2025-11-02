import { Module } from '@nestjs/common';
import { DesktopService } from './services/desktop.service';
import { DesktopDomainInteractor } from '~/domain/desktop/interactors/desktop.interactor';
import { DesktopResolver } from './resolvers/desktop.resolver';
import { ExtensionDomainModule } from '~/domain/extension/extension-domain.module';

@Module({
  imports: [ExtensionDomainModule],
  controllers: [],
  providers: [DesktopDomainInteractor, DesktopService, DesktopResolver],
  exports: [],
})
export class DesktopModule {}
