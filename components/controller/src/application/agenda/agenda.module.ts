import { Module } from '@nestjs/common';
import { AgendaResolver } from './resolvers/agenda.resolver';
import { AgendaService } from './services/agenda.service';
import { AgendaDomainModule } from '~/domain/agenda/agenda-domain.module';
import { UserCertificateDomainModule } from '~/domain/user-certificate/user-certificate.module';
import { ExtensionPortsModule } from '~/domain/extension/extension-ports.module';

@Module({
  imports: [AgendaDomainModule, UserCertificateDomainModule, ExtensionPortsModule],
  controllers: [],
  providers: [AgendaResolver, AgendaService],
  exports: [],
})
export class AgendaModule {}
