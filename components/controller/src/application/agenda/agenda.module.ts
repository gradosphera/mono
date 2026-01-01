import { Module } from '@nestjs/common';
import { AgendaResolver } from './resolvers/agenda.resolver';
import { AgendaService } from './services/agenda.service';
import { AgendaInteractor } from './interactors/agenda.interactor';
import { AgendaDomainModule } from '~/domain/agenda/agenda-domain.module';
import { UserCertificateDomainModule } from '~/domain/user-certificate/user-certificate.module';
import { ExtensionPortsModule } from '~/domain/extension/extension-ports.module';
import { DocumentDomainModule } from '~/domain/document/document.module';

@Module({
  imports: [AgendaDomainModule, DocumentDomainModule, UserCertificateDomainModule, ExtensionPortsModule],
  controllers: [],
  providers: [AgendaInteractor, AgendaResolver, AgendaService],
  exports: [],
})
export class AgendaModule {}
