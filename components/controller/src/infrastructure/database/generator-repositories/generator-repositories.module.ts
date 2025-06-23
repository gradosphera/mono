// infrastructure/database/generator/generator.module.ts
import { Global, Module } from '@nestjs/common';
import { OrganizationRepositoryImplementation } from './repositories/organization-generator.repository';
import { ORGANIZATION_REPOSITORY } from '~/domain/common/repositories/organization.repository';
import { INDIVIDUAL_REPOSITORY } from '~/domain/common/repositories/individual.repository';
import { ENTREPRENEUR_REPOSITORY } from '~/domain/common/repositories/entrepreneur.repository';
import { EntrepreneurRepositoryImplementation } from './repositories/entrepreneur-generator.repository';
import { IndividualRepositoryImplementation } from './repositories/individual-generator.repository';
import { PAYMENT_METHOD_REPOSITORY } from '~/domain/common/repositories/payment-method.repository';
import { PaymentMethodRepositoryImplementation } from './repositories/payment-method-generator.repository';
import { DOCUMENT_REPOSITORY } from '~/domain/document/repository/document.repository';
import { DocumentRepositoryImplementation } from './repositories/document-generator.repository';
import { PROJECT_FREE_DECISION_REPOSITORY } from '~/domain/common/repositories/project-free-decision.repository';
import { ProjectFreeDecisionRepositoryImplementation } from './repositories/project-free-decision-generator.repository';
import { VARS_REPOSITORY } from '~/domain/common/repositories/vars.repository';
import { VarsRepositoryImplementation } from './repositories/vars-generator.repository';
import { SEARCH_PRIVATE_ACCOUNTS_REPOSITORY } from '~/domain/common/repositories/search-private-accounts.repository';
import { SearchPrivateAccountsRepositoryImplementation } from './repositories/search-private-accounts-generator.repository';

@Global()
@Module({
  providers: [
    {
      provide: ORGANIZATION_REPOSITORY,
      useClass: OrganizationRepositoryImplementation,
    },
    {
      provide: INDIVIDUAL_REPOSITORY,
      useClass: IndividualRepositoryImplementation,
    },
    {
      provide: ENTREPRENEUR_REPOSITORY,
      useClass: EntrepreneurRepositoryImplementation,
    },
    {
      provide: PAYMENT_METHOD_REPOSITORY,
      useClass: PaymentMethodRepositoryImplementation,
    },
    {
      provide: DOCUMENT_REPOSITORY,
      useClass: DocumentRepositoryImplementation,
    },
    {
      provide: PROJECT_FREE_DECISION_REPOSITORY,
      useClass: ProjectFreeDecisionRepositoryImplementation,
    },
    {
      provide: VARS_REPOSITORY,
      useClass: VarsRepositoryImplementation,
    },
    {
      provide: SEARCH_PRIVATE_ACCOUNTS_REPOSITORY,
      useClass: SearchPrivateAccountsRepositoryImplementation,
    },
  ],
  exports: [
    ORGANIZATION_REPOSITORY,
    INDIVIDUAL_REPOSITORY,
    ENTREPRENEUR_REPOSITORY,
    PAYMENT_METHOD_REPOSITORY,
    DOCUMENT_REPOSITORY,
    PROJECT_FREE_DECISION_REPOSITORY,
    VARS_REPOSITORY,
    SEARCH_PRIVATE_ACCOUNTS_REPOSITORY,
  ],
})
export class GeneratorRepositoriesModule {}
