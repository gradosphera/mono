import { Injectable } from '@nestjs/common';
import type {
  ProjectFreeDecisionDocumentDTO,
  ProjectFreeDecisionGenerateDocumentInputDTO,
} from '../dto/project-free-decision-document.dto';
import { GenerateDocumentOptionsInputDTO } from '~/modules/document/dto/generate-document-options-input.dto';
import { DecisionDomainInteractor } from '~/domain/decision/interactors/decision.interactor';
import { CreateProjectFreeDecisionDTO } from '../dto/create-project-free-decision-input.dto';

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

  public async publishProjectOfFreeDecision(data: CreateProjectFreeDecisionDTO): Promise<boolean> {
    const selected = await this.decisionDomainInteractor.publishProjectOfFreeDecision(data);
    return selected;
  }
}
