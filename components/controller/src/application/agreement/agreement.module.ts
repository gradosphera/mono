import { Module } from '@nestjs/common';
import { DomainModule } from '~/domain/domain.module';
import { AgreementResolver } from './resolvers/agreement.resolver';
import { AgreementService } from './services/agreement.service';

@Module({
  imports: [DomainModule],
  controllers: [],
  providers: [AgreementResolver, AgreementService],
  exports: [],
})
export class AgreementModule {}
