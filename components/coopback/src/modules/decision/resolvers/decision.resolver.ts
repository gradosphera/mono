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
import { PublishProjectFreeDecisionInputDTO } from '../dto/publish-project-free-decision-input.dto';
import { CreatedProjectFreeDecisionDTO } from '../dto/created-project-free-decision.dto';
import { CreateProjectFreeDecisionInputDTO } from '../dto/create-project-free-decision.dto';

@Resolver()
export class DecisionResolver {
  constructor(private readonly decisionService: DecisionService) {}

  @Mutation(() => ProjectFreeDecisionDocumentDTO, {
    name: 'generateProjectOfFreeDecision',
    description: 'Сгенерировать документ проекта свободного решения',
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
    @Args('data', { type: () => PublishProjectFreeDecisionInputDTO })
    data: PublishProjectFreeDecisionInputDTO
  ): Promise<boolean> {
    return this.decisionService.publishProjectOfFreeDecision(data);
  }

  @Mutation(() => CreatedProjectFreeDecisionDTO, {
    name: 'createProjectOfFreeDecision',
    description:
      'Создать проект свободного решения и сохранить в хранилище для дальнейшей генерации документа проекта и его публикации',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman', 'member'])
  async createProjectOfFreeDecision(
    @Args('data', { type: () => CreateProjectFreeDecisionInputDTO })
    data: CreateProjectFreeDecisionInputDTO
  ): Promise<CreatedProjectFreeDecisionDTO> {
    return this.decisionService.createProjectOfFreeDecision(data);
  }
}
