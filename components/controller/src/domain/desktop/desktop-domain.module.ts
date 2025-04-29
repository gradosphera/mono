import { Module } from '@nestjs/common';
import { ExtensionDomainModule } from '../extension/extension-domain.module';
import { DesktopDomainInteractor } from './interactors/desktop.interactor';

@Module({
  imports: [ExtensionDomainModule],
  providers: [DesktopDomainInteractor],
  exports: [DesktopDomainInteractor],
})
export class DesktopDomainModule {}
