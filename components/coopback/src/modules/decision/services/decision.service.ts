import { Injectable } from '@nestjs/common';
import type {
  ProjectFreeDecisionDocumentDTO,
  ProjectFreeDecisionGenerateDocumentInputDTO,
} from '../dto/project-free-decision-document.dto';
import { GenerateDocumentOptionsInputDTO } from '~/modules/document/dto/generate-document-options-input.dto';
import { DecisionDomainInteractor } from '~/domain/decision/interactors/decision.interactor';
import { PublishProjectFreeDecisionInputDTO } from '../dto/publish-project-free-decision-input.dto';
import type { CreateProjectFreeDecisionInputDTO } from '../dto/create-project-free-decision.dto';
import { CreatedProjectFreeDecisionDTO } from '../dto/created-project-free-decision.dto';
import { v4 } from 'uuid';

@Injectable()
export class DecisionService {
  constructor(private readonly decisionDomainInteractor: DecisionDomainInteractor) {}

  public async generateProjectOfFreeDecision(
    data: ProjectFreeDecisionGenerateDocumentInputDTO,
    options: GenerateDocumentOptionsInputDTO
  ): Promise<ProjectFreeDecisionDocumentDTO> {
    const document = await this.decisionDomainInteractor.generateProjectOfFreeDecisionDocument(data, options);
    //TODO чтобы избавиться от unknown необходимо строго типизировать ответ фабрики документов
    return document as unknown as ProjectFreeDecisionDocumentDTO;
  }

  public async publishProjectOfFreeDecision(data: PublishProjectFreeDecisionInputDTO): Promise<boolean> {
    const selected = await this.decisionDomainInteractor.publishProjectOfFreeDecision(data);
    return selected;
  }

  public async createProjectOfFreeDecision(data: CreateProjectFreeDecisionInputDTO): Promise<CreatedProjectFreeDecisionDTO> {
    const id = v4();
    const project = await this.decisionDomainInteractor.createProjectOfFreeDecision({ ...data, id });
    return new CreatedProjectFreeDecisionDTO(project);
  }
}
