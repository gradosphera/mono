import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { GqlJwtAuthGuard } from '~/modules/auth/guards/graphql-jwt-auth.guard';
import { RolesGuard } from '~/modules/auth/guards/roles.guard';
import { UseGuards } from '@nestjs/common';
import { AuthRoles } from '~/modules/auth/decorators/auth.decorator';
import { GenerateDocumentOptionsInputDTO } from '~/modules/document/dto/generate-document-options-input.dto';
import { Throttle } from '@nestjs/throttler';
import { CooplaceService } from '../services/cooplace.service';
import {
  AssetContributionStatementDocumentDTO,
  AssetContributionStatementGenerateDocumentInputDTO,
} from '../dto/asset-contribution-statement.dto';
import {
  AssetContributionDecisionDocumentDTO,
  AssetContributionDecisionGenerateDocumentInputDTO,
} from '../dto/asset-contribution-decision.dto';
import {
  AssetContributionActDocumentDTO,
  AssetContributionActGenerateDocumentInputDTO,
} from '../dto/asset-contribution-act.dto';
import {
  ReturnByAssetStatementDocumentDTO,
  ReturnByAssetStatementGenerateDocumentInputDTO,
} from '../dto/return-by-asset-statement.dto';
import {
  ReturnByAssetDecisionDocumentDTO,
  ReturnByAssetDecisionGenerateDocumentInputDTO,
} from '../dto/return-by-asset-decision.dto';
import { ReturnByAssetActDocumentDTO, ReturnByAssetActGenerateDocumentInputDTO } from '../dto/return-by-asset-act.dto';

@Resolver()
export class CooplaceResolver {
  constructor(private readonly cooplaceService: CooplaceService) {}

  @Mutation(() => AssetContributionStatementDocumentDTO, {
    name: 'generateAssetContributionStatement',
    description: 'Сгенерировать документ заявления о вступлении в кооператив.',
  })
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman', 'member'])
  async generateAssetContributionStatement(
    @Args('data', { type: () => AssetContributionStatementGenerateDocumentInputDTO })
    data: AssetContributionStatementGenerateDocumentInputDTO,
    @Args('options', { type: () => GenerateDocumentOptionsInputDTO, nullable: true })
    options: GenerateDocumentOptionsInputDTO
  ): Promise<AssetContributionStatementDocumentDTO> {
    return this.cooplaceService.generateAssetContributionStatement(data, options);
  }

  @Mutation(() => AssetContributionDecisionDocumentDTO, {
    name: 'generateAssetContributionDecision',
    description: 'Сгенерировать документ решения о вступлении в кооператив.',
  })
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman', 'member'])
  async generateAssetContributionDecision(
    @Args('data', { type: () => AssetContributionDecisionGenerateDocumentInputDTO })
    data: AssetContributionDecisionGenerateDocumentInputDTO,
    @Args('options', { type: () => GenerateDocumentOptionsInputDTO, nullable: true })
    options: GenerateDocumentOptionsInputDTO
  ): Promise<AssetContributionDecisionDocumentDTO> {
    return this.cooplaceService.generateAssetContributionDecision(data, options);
  }

  @Mutation(() => AssetContributionActDocumentDTO, {
    name: 'generateAssetContributionAct',
    description: 'Сгенерировать документ акта приема-передачи.',
  })
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman', 'member'])
  async generateAssetContributionAct(
    @Args('data', { type: () => AssetContributionActGenerateDocumentInputDTO })
    data: AssetContributionActGenerateDocumentInputDTO,
    @Args('options', { type: () => GenerateDocumentOptionsInputDTO, nullable: true })
    options: GenerateDocumentOptionsInputDTO
  ): Promise<AssetContributionActDocumentDTO> {
    return this.cooplaceService.generateAssetContributionAct(data, options);
  }

  @Mutation(() => ReturnByAssetStatementDocumentDTO, {
    name: 'generateReturnByAssetStatement',
    description: 'Сгенерировать документ заявления о возврате имущества.',
  })
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman', 'member'])
  async generateReturnByAssetStatement(
    @Args('data', { type: () => ReturnByAssetStatementGenerateDocumentInputDTO })
    data: ReturnByAssetStatementGenerateDocumentInputDTO,
    @Args('options', { type: () => GenerateDocumentOptionsInputDTO, nullable: true })
    options: GenerateDocumentOptionsInputDTO
  ): Promise<ReturnByAssetStatementDocumentDTO> {
    return this.cooplaceService.generateReturnByAssetStatement(data, options);
  }

  @Mutation(() => ReturnByAssetDecisionDocumentDTO, {
    name: 'generateReturnByAssetDecision',
    description: 'Сгенерировать документ решения о возврате имущества.',
  })
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman', 'member'])
  async generateReturnByAssetDecision(
    @Args('data', { type: () => ReturnByAssetDecisionGenerateDocumentInputDTO })
    data: ReturnByAssetDecisionGenerateDocumentInputDTO,
    @Args('options', { type: () => GenerateDocumentOptionsInputDTO, nullable: true })
    options: GenerateDocumentOptionsInputDTO
  ): Promise<ReturnByAssetDecisionDocumentDTO> {
    return this.cooplaceService.generateReturnByAssetDecision(data, options);
  }

  @Mutation(() => ReturnByAssetActDocumentDTO, {
    name: 'generateReturnByAssetAct',
    description: 'Сгенерировать документ акта возврата имущества.',
  })
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman', 'member'])
  async generateReturnByAssetAct(
    @Args('data', { type: () => ReturnByAssetActGenerateDocumentInputDTO })
    data: ReturnByAssetActGenerateDocumentInputDTO,
    @Args('options', { type: () => GenerateDocumentOptionsInputDTO, nullable: true })
    options: GenerateDocumentOptionsInputDTO
  ): Promise<ReturnByAssetActDocumentDTO> {
    return this.cooplaceService.generateReturnByAssetAct(data, options);
  }
}
