import { Module } from '@nestjs/common';
import { DomainModule } from '~/domain/domain.module';
import { InfrastructureModule } from '~/infrastructure/infrastructure.module';
import { AgreementResolver } from './resolvers/agreement.resolver';
import { AgreementService } from './services/agreement.service';
import { AgreementInteractor } from './use-cases/agreement.interactor';

@Module({
  imports: [DomainModule, InfrastructureModule],
  controllers: [],
  providers: [AgreementResolver, AgreementService, AgreementInteractor],
  exports: [],
})
export class AgreementModule {}
