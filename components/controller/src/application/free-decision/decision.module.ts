import { Module, forwardRef } from '@nestjs/common';
import { DocumentModule } from '../document/document.module';
import { FreeDecisionResolver } from './resolvers/free-decision.resolver';
import { FreeDecisionService } from './services/free-decision.service';
import { FreeDecisionDomainModule } from '~/domain/free-decision/free-decision.module';
import { DocumentDomainModule } from '~/domain/document/document.module';
import { GeneratorInfrastructureModule } from '~/infrastructure/generator/generator.module';
import { UserCertificateDomainModule } from '~/domain/user-certificate/user-certificate.module';
import { FreeDecisionInteractor } from './interactors/free-decision.interactor';

@Module({
  imports: [
    DocumentModule,
    FreeDecisionDomainModule,
    DocumentDomainModule,
    GeneratorInfrastructureModule,
    forwardRef(() => UserCertificateDomainModule),
  ],
  controllers: [],
  providers: [FreeDecisionResolver, FreeDecisionService, FreeDecisionInteractor],
  exports: [FreeDecisionInteractor],
})
export class DecisionModule {}
