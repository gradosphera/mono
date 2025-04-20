import { Injectable } from '@nestjs/common';
import type {
  ProjectFreeDecisionDocumentDTO,
  ProjectFreeDecisionGenerateDocumentInputDTO,
} from '../../document/documents-dto/project-free-decision-document.dto';
import { GenerateDocumentOptionsInputDTO } from '~/modules/document/dto/generate-document-options-input.dto';
import { PublishProjectFreeDecisionInputDTO } from '../dto/publish-project-free-decision-input.dto';
import type { CreateProjectFreeDecisionInputDTO } from '../dto/create-project-free-decision.dto';
import { CreatedProjectFreeDecisionDTO } from '../dto/created-project-free-decision.dto';
import { v4 } from 'uuid';
import type {
  FreeDecisionDocumentDTO,
  FreeDecisionGenerateDocumentInputDTO,
} from '../../document/documents-dto/free-decision-document.dto';
import { FreeDecisionDomainInteractor } from '~/domain/free-decision/interactors/free-decision.interactor';

@Injectable()
export class FreeDecisionService {
  constructor(private readonly freeDecisionDomainInteractor: FreeDecisionDomainInteractor) {}

  public async generateProjectOfFreeDecision(
    data: ProjectFreeDecisionGenerateDocumentInputDTO,
    options: GenerateDocumentOptionsInputDTO
  ): Promise<ProjectFreeDecisionDocumentDTO> {
    const document = await this.freeDecisionDomainInteractor.generateProjectOfFreeDecisionDocument(data, options);
    //TODO чтобы избавиться от unknown необходимо строго типизировать ответ фабрики документов
    return document as unknown as ProjectFreeDecisionDocumentDTO;
  }

  public async generateFreeDecision(
    data: FreeDecisionGenerateDocumentInputDTO,
    options: GenerateDocumentOptionsInputDTO
  ): Promise<FreeDecisionDocumentDTO> {
    const document = await this.freeDecisionDomainInteractor.generateFreeDecisionDocument(data, options);
    //TODO чтобы избавиться от unknown необходимо строго типизировать ответ фабрики документов
    return document as unknown as FreeDecisionDocumentDTO;
  }

  public async publishProjectOfFreeDecision(data: PublishProjectFreeDecisionInputDTO): Promise<boolean> {
    const selected = await this.freeDecisionDomainInteractor.publishProjectOfFreeDecision(data);
    return selected;
  }

  public async createProjectOfFreeDecision(data: CreateProjectFreeDecisionInputDTO): Promise<CreatedProjectFreeDecisionDTO> {
    const id = v4();
    const project = await this.freeDecisionDomainInteractor.createProjectOfFreeDecision({ ...data, id });
    return new CreatedProjectFreeDecisionDTO(project);
  }
}
