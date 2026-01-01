import { Cooperative } from 'cooptypes';
import { ProjectFreeDecisionDomainEntity } from '~/domain/branch/entities/project-free-decision.entity';
import { DocumentDomainEntity } from '~/domain/document/entity/document-domain.entity';
import { PublishProjectFreeDecisionInputDomainInterface } from '../interfaces/publish-project-free-decision.interface';

export interface FreeDecisionPort {
  createProjectOfFreeDecision(data: Cooperative.Document.IProjectData): Promise<ProjectFreeDecisionDomainEntity>;
  generateProjectOfFreeDecisionDocument(
    data: Cooperative.Registry.ProjectFreeDecision.Action,
    options?: Cooperative.Document.IGenerationOptions
  ): Promise<DocumentDomainEntity>;
  generateFreeDecisionDocument(
    data: Cooperative.Registry.FreeDecision.Action,
    options: Cooperative.Document.IGenerationOptions
  ): Promise<DocumentDomainEntity>;
  publishProjectOfFreeDecision(data: PublishProjectFreeDecisionInputDomainInterface): Promise<boolean>;
}

export const FREE_DECISION_PORT = Symbol('FreeDecisionPort');
