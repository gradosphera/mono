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
  ],
  exports: [
    ORGANIZATION_REPOSITORY,
    INDIVIDUAL_REPOSITORY,
    ENTREPRENEUR_REPOSITORY,
    PAYMENT_METHOD_REPOSITORY,
    DOCUMENT_REPOSITORY,
  ],
})
export class GeneratorRepositoriesModule {}
