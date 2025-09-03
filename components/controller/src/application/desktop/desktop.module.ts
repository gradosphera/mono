import { Module } from '@nestjs/common';
import { DesktopService } from './services/desktop.service';
import { DomainModule } from '~/domain/domain.module';
import { DesktopDomainInteractor } from '~/domain/desktop/interactors/desktop.interactor';
import { DesktopResolver } from './resolvers/desktop.resolver';

@Module({
  imports: [DomainModule],
  controllers: [],
  providers: [DesktopDomainInteractor, DesktopService, DesktopResolver],
  exports: [],
})
export class DesktopModule {}
