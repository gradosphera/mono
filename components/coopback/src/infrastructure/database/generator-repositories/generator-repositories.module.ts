// infrastructure/database/generator/generator.module.ts
import { Global, Module } from '@nestjs/common';
import { OrganizationRepositoryImplementation } from './repositories/organization-generator.repository';
import { ORGANIZATION_REPOSITORY } from '~/domain/common/repositories/organization.repository';
@Global()
@Module({
  providers: [
    {
      provide: ORGANIZATION_REPOSITORY,
      useClass: OrganizationRepositoryImplementation,
    },
  ],
  exports: [ORGANIZATION_REPOSITORY],
})
export class GeneratorRepositoriesModule {}
