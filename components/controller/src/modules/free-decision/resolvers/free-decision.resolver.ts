import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { GqlJwtAuthGuard } from '~/modules/auth/guards/graphql-jwt-auth.guard';
import { RolesGuard } from '~/modules/auth/guards/roles.guard';
import { UseGuards } from '@nestjs/common';
import { AuthRoles } from '~/modules/auth/decorators/auth.decorator';
import { ProjectFreeDecisionGenerateDocumentInputDTO } from '../../document/documents-dto/project-free-decision-document.dto';
import { GenerateDocumentOptionsInputDTO } from '~/modules/document/dto/generate-document-options-input.dto';
import { Throttle } from '@nestjs/throttler';
import { PublishProjectFreeDecisionInputDTO } from '../dto/publish-project-free-decision-input.dto';
import { CreatedProjectFreeDecisionDTO } from '../dto/created-project-free-decision.dto';
import { CreateProjectFreeDecisionInputDTO } from '../dto/create-project-free-decision.dto';
import { FreeDecisionGenerateDocumentInputDTO } from '../../document/documents-dto/free-decision-document.dto';
import { FreeDecisionService } from '../services/free-decision.service';
import { GeneratedDocumentDTO } from '~/modules/document/dto/generated-document.dto';

@Resolver()
export class FreeDecisionResolver {
  constructor(private readonly freeDecisionService: FreeDecisionService) {}

  @Mutation(() => GeneratedDocumentDTO, {
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
  ): Promise<GeneratedDocumentDTO> {
    return this.freeDecisionService.generateProjectOfFreeDecision(data, options);
  }

  @Mutation(() => GeneratedDocumentDTO, {
    name: 'generateFreeDecision',
    description: 'Сгенерировать протокол решения по предложенной повестке',
  })
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman', 'member'])
  async generateFreeDecision(
    @Args('data', { type: () => FreeDecisionGenerateDocumentInputDTO })
    data: FreeDecisionGenerateDocumentInputDTO,
    @Args('options', { type: () => GenerateDocumentOptionsInputDTO, nullable: true })
    options: GenerateDocumentOptionsInputDTO
  ): Promise<GeneratedDocumentDTO> {
    return this.freeDecisionService.generateFreeDecision(data, options);
  }

  @Mutation(() => Boolean, {
    name: 'publishProjectOfFreeDecision',
    description: 'Опубликовать предложенную повестку и проект решения для дальнейшего голосования совета по нему',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman', 'member'])
  async publishProjectOfFreeDecision(
    @Args('data', { type: () => PublishProjectFreeDecisionInputDTO })
    data: PublishProjectFreeDecisionInputDTO
  ): Promise<boolean> {
    return this.freeDecisionService.publishProjectOfFreeDecision(data);
  }

  @Mutation(() => CreatedProjectFreeDecisionDTO, {
    name: 'createProjectOfFreeDecision',
    description:
      'Создать повестку дня и проект решения, и сохранить в хранилище для дальнейшей генерации документа и его публикации',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman', 'member'])
  async createProjectOfFreeDecision(
    @Args('data', { type: () => CreateProjectFreeDecisionInputDTO })
    data: CreateProjectFreeDecisionInputDTO
  ): Promise<CreatedProjectFreeDecisionDTO> {
    return this.freeDecisionService.createProjectOfFreeDecision(data);
  }
}
