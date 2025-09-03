import { Module } from '@nestjs/common';
import { DomainModule } from '~/domain/domain.module';
import { AgendaResolver } from './resolvers/agenda.resolver';
import { AgendaService } from './services/agenda.service';

@Module({
  imports: [DomainModule],
  controllers: [],
  providers: [AgendaResolver, AgendaService],
  exports: [],
})
export class AgendaModule {}
