import { Injectable } from '@nestjs/common';
import { GenerateDocumentOptionsInputDTO } from '~/application/document/dto/generate-document-options-input.dto';
import { PublishProjectFreeDecisionInputDTO } from '../dto/publish-project-free-decision-input.dto';
import type { CreateProjectFreeDecisionInputDTO } from '../dto/create-project-free-decision.dto';
import { CreatedProjectFreeDecisionDTO } from '../dto/created-project-free-decision.dto';
import { v4 } from 'uuid';
import type { FreeDecisionGenerateDocumentInputDTO } from '../../document/documents-dto/free-decision-document.dto';
import { FreeDecisionInteractor } from '~/application/free-decision/interactors/free-decision.interactor';
import type { ProjectFreeDecisionGenerateDocumentInputDTO } from '~/application/document/documents-dto/project-free-decision-document.dto';
import type { GeneratedDocumentDTO } from '~/application/document/dto/generated-document.dto';

@Injectable()
export class FreeDecisionService {
  constructor(private readonly freeDecisionInteractor: FreeDecisionInteractor) {}

  public async generateProjectOfFreeDecision(
    data: ProjectFreeDecisionGenerateDocumentInputDTO,
    options: GenerateDocumentOptionsInputDTO
  ): Promise<GeneratedDocumentDTO> {
    const document = await this.freeDecisionInteractor.generateProjectOfFreeDecisionDocument(data, options);
    //TODO чтобы избавиться от unknown необходимо строго типизировать ответ фабрики документов
    return document as unknown as GeneratedDocumentDTO;
  }

  public async generateFreeDecision(
    data: FreeDecisionGenerateDocumentInputDTO,
    options: GenerateDocumentOptionsInputDTO
  ): Promise<GeneratedDocumentDTO> {
    const document = await this.freeDecisionInteractor.generateFreeDecisionDocument(data, options);
    //TODO чтобы избавиться от unknown необходимо строго типизировать ответ фабрики документов
    return document as unknown as GeneratedDocumentDTO;
  }

  public async publishProjectOfFreeDecision(data: PublishProjectFreeDecisionInputDTO): Promise<boolean> {
    const selected = await this.freeDecisionInteractor.publishProjectOfFreeDecision(data);
    return selected;
  }

  public async createProjectOfFreeDecision(data: CreateProjectFreeDecisionInputDTO): Promise<CreatedProjectFreeDecisionDTO> {
    const id = v4();
    const project = await this.freeDecisionInteractor.createProjectOfFreeDecision({ ...data, id });
    return new CreatedProjectFreeDecisionDTO(project);
  }
}
