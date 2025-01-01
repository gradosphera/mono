import { Cooperative } from 'cooptypes';
import { DocumentDomainService } from '~/domain/document/services/document-domain.service';
import { DocumentDomainEntity } from '~/domain/document/entity/document-domain.entity';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import type { PublishProjectFreeDecisionInputDomainInterface } from '../interfaces/publish-project-free-decision.interface';
import config from '~/config/config';
import { FREE_DECISION_BLOCKCHAIN_PORT, FreeDecisionBlockchainPort } from '../interfaces/free-decision-blockchain.port';
import {
  PROJECT_FREE_DECISION_REPOSITORY,
  ProjectFreeDecisionRepository,
} from '~/domain/common/repositories/project-free-decision.repository';
import { ProjectFreeDecisionDomainEntity } from '~/domain/branch/entities/project-free-decision.entity';

@Injectable()
export class FreeDecisionDomainInteractor {
  constructor(
    private readonly documentDomainService: DocumentDomainService,
    @Inject(PROJECT_FREE_DECISION_REPOSITORY) private readonly projectDecisionRepository: ProjectFreeDecisionRepository,
    @Inject(FREE_DECISION_BLOCKCHAIN_PORT) private readonly FreeDecisionBlockchainPort: FreeDecisionBlockchainPort
  ) {}

  async createProjectOfFreeDecision(data: Cooperative.Document.IProjectData): Promise<ProjectFreeDecisionDomainEntity> {
    await this.projectDecisionRepository.create(data);
    return new ProjectFreeDecisionDomainEntity(data);
  }

  async generateProjectOfFreeDecisionDocument(
    data: Cooperative.Registry.ProjectFreeDecision.Action,
    options: Cooperative.Document.IGenerationOptions
  ): Promise<DocumentDomainEntity> {
    data.registry_id = Cooperative.Registry.ProjectFreeDecision.registry_id;
    return await this.documentDomainService.generateDocument({ data, options });
  }

  async generateFreeDecisionDocument(
    data: Cooperative.Registry.FreeDecision.Action,
    options: Cooperative.Document.IGenerationOptions
  ): Promise<DocumentDomainEntity> {
    data.registry_id = Cooperative.Registry.FreeDecision.registry_id;
    return await this.documentDomainService.generateDocument({ data, options });
  }

  async publishProjectOfFreeDecision(data: PublishProjectFreeDecisionInputDomainInterface): Promise<boolean> {
    const document = await this.documentDomainService.getDocumentByHash(data.document.hash);

    if (!document) throw new BadRequestException('Документ не найден');

    if (data.document.meta.registry_id != Cooperative.Registry.ProjectFreeDecision.registry_id)
      throw new BadRequestException('Неверный registry_id в переданном документе, ожидается registry_id == 101');

    if (data.coopname != config.coopname)
      throw new BadRequestException('Указанное имя аккаунта кооператива не обслуживается здесь');

    await this.FreeDecisionBlockchainPort.publichProjectOfFreeDecision({
      coopname: data.coopname,
      username: data.username,
      meta: data.meta,
      document: { ...data.document, meta: JSON.stringify(data.document.meta) },
    });

    return true;
  }
}
