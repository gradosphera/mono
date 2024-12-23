import type { ProjectFreeDecisionDomainInterface } from '~/domain/common/interfaces/project-free-decision-domain.interface';

export class ProjectFreeDecisionDomainEntity implements ProjectFreeDecisionDomainInterface {
  public readonly id!: string;
  public readonly header!: string;
  public readonly question!: string;
  public readonly decision!: string;

  constructor(data: ProjectFreeDecisionDomainInterface) {
    Object.assign(this, data);
  }
}
