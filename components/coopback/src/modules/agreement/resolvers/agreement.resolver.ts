import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { GqlJwtAuthGuard } from '~/modules/auth/guards/graphql-jwt-auth.guard';
import { RolesGuard } from '~/modules/auth/guards/roles.guard';
import { UseGuards } from '@nestjs/common';
import { AuthRoles } from '~/modules/auth/decorators/auth.decorator';
import { GenerateDocumentOptionsInputDTO } from '~/modules/document/dto/generate-document-options-input.dto';
import { Throttle } from '@nestjs/throttler';
import { GeneratedDocumentDTO } from '~/modules/document/dto/generated-document.dto';
import { GenerateDocumentInputDTO } from '~/modules/document/dto/generate-document-input.dto';
import { AgreementService } from '../services/agreement.service';

@Resolver()
export class AgreementResolver {
  constructor(private readonly agreementService: AgreementService) {}

  @Mutation(() => GeneratedDocumentDTO, {
    name: 'generateWalletAgreement',
    description: 'Сгенерировать документ соглашения о целевой потребительской программе "Цифровой Кошелёк"',
  })
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman', 'member'])
  async generateWalletAgreement(
    @Args('data', { type: () => GenerateDocumentInputDTO })
    data: GenerateDocumentInputDTO,
    @Args('options', { type: () => GenerateDocumentOptionsInputDTO, nullable: true })
    options: GenerateDocumentOptionsInputDTO
  ): Promise<GeneratedDocumentDTO> {
    return this.agreementService.generateWalletAgreement(data, options);
  }

  @Mutation(() => GeneratedDocumentDTO, {
    name: 'generatePrivacyAgreement',
    description: 'Сгенерировать документ соглашения с политикой конфиденциальности',
  })
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman', 'member'])
  async generatePrivacyAgreement(
    @Args('data', { type: () => GenerateDocumentInputDTO })
    data: GenerateDocumentInputDTO,
    @Args('options', { type: () => GenerateDocumentOptionsInputDTO, nullable: true })
    options: GenerateDocumentOptionsInputDTO
  ): Promise<GeneratedDocumentDTO> {
    return this.agreementService.generatePrivacyAgreement(data, options);
  }

  @Mutation(() => GeneratedDocumentDTO, {
    name: 'generateSignatureAgreement',
    description: 'Сгенерировать документ соглашения о целевой потребительской программе "Цифровой Кошелёк"',
  })
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman', 'member'])
  async generateSignatureAgreement(
    @Args('data', { type: () => GenerateDocumentInputDTO })
    data: GenerateDocumentInputDTO,
    @Args('options', { type: () => GenerateDocumentOptionsInputDTO, nullable: true })
    options: GenerateDocumentOptionsInputDTO
  ): Promise<GeneratedDocumentDTO> {
    return this.agreementService.generateSignatureAgreement(data, options);
  }

  @Mutation(() => GeneratedDocumentDTO, {
    name: 'generateUserAgreement',
    description: 'Сгенерировать документ пользовательского соглашения',
  })
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman', 'member'])
  async generateUserAgreement(
    @Args('data', { type: () => GenerateDocumentInputDTO })
    data: GenerateDocumentInputDTO,
    @Args('options', { type: () => GenerateDocumentOptionsInputDTO, nullable: true })
    options: GenerateDocumentOptionsInputDTO
  ): Promise<GeneratedDocumentDTO> {
    return this.agreementService.generateUserAgreement(data, options);
  }
}
