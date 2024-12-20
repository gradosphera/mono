import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { GqlJwtAuthGuard } from '~/modules/auth/guards/graphql-jwt-auth.guard';
import { RolesGuard } from '~/modules/auth/guards/roles.guard';
import { UseGuards } from '@nestjs/common';
import { AuthRoles } from '~/modules/auth/decorators/auth.decorator';
import { DecisionService } from '../services/decision.service';
import {
  ProjectFreeDecisionDocumentDTO,
  ProjectFreeDecisionGenerateDocumentInputDTO,
} from '../dto/project-free-decision-document.dto';
import { GenerateDocumentOptionsInputDTO } from '~/modules/document/dto/generate-document-options-input.dto';
import { Throttle } from '@nestjs/throttler';
import { CreateProjectFreeDecisionDTO } from '../dto/create-project-free-decision-input.dto';

@Resolver()
export class DecisionResolver {
  constructor(private readonly decisionService: DecisionService) {}

  @Mutation(() => ProjectFreeDecisionDocumentDTO, {
    name: 'generateProjectOfFreeDecision',
    description: 'Сгенерировать проект свободного решения',
  })
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman', 'member'])
  async generateProjectOfFreeDecision(
    @Args('data', { type: () => ProjectFreeDecisionGenerateDocumentInputDTO })
    data: ProjectFreeDecisionGenerateDocumentInputDTO,
    @Args('options', { type: () => GenerateDocumentOptionsInputDTO, nullable: true })
    options: GenerateDocumentOptionsInputDTO
  ): Promise<ProjectFreeDecisionDocumentDTO> {
    return this.decisionService.generateProjectOfFreeDecision(data, options);
  }

  @Mutation(() => Boolean, {
    name: 'publishProjectOfFreeDecision',
    description: 'Опубликовать проект свободного решения для дальнейшего голосования совета по нему',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman', 'member'])
  async publishProjectOfFreeDecision(
    @Args('data', { type: () => CreateProjectFreeDecisionDTO })
    data: CreateProjectFreeDecisionDTO
  ): Promise<boolean> {
    return this.decisionService.publishProjectOfFreeDecision(data);
  }
}
