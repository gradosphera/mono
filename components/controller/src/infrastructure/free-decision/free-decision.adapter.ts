import { Injectable } from '@nestjs/common';
import { FreeDecisionPort, FREE_DECISION_PORT } from '~/domain/free-decision/ports/free-decision.port';
import { FreeDecisionInteractor } from '~/application/free-decision/interactors/free-decision.interactor';
import { Cooperative } from 'cooptypes';
import { ProjectFreeDecisionDomainEntity } from '~/domain/branch/entities/project-free-decision.entity';
import { DocumentDomainEntity } from '~/domain/document/entity/document-domain.entity';
import { PublishProjectFreeDecisionInputDomainInterface } from '~/domain/free-decision/interfaces/publish-project-free-decision.interface';

@Injectable()
export class FreeDecisionAdapter implements FreeDecisionPort {
  constructor(private readonly freeDecisionInteractor: FreeDecisionInteractor) {}

  async createProjectOfFreeDecision(data: Cooperative.Document.IProjectData): Promise<ProjectFreeDecisionDomainEntity> {
    return this.freeDecisionInteractor.createProjectOfFreeDecision(data);
  }

  async generateProjectOfFreeDecisionDocument(
    data: Cooperative.Registry.ProjectFreeDecision.Action,
    options?: Cooperative.Document.IGenerationOptions
  ): Promise<DocumentDomainEntity> {
    return this.freeDecisionInteractor.generateProjectOfFreeDecisionDocument(data, options);
  }

  async generateFreeDecisionDocument(
    data: Cooperative.Registry.FreeDecision.Action,
    options: Cooperative.Document.IGenerationOptions
  ): Promise<DocumentDomainEntity> {
    return this.freeDecisionInteractor.generateFreeDecisionDocument(data, options);
  }

  async publishProjectOfFreeDecision(data: PublishProjectFreeDecisionInputDomainInterface): Promise<boolean> {
    return this.freeDecisionInteractor.publishProjectOfFreeDecision(data);
  }
}

export const FREE_DECISION_ADAPTER = {
  provide: FREE_DECISION_PORT,
  useClass: FreeDecisionAdapter,
};
