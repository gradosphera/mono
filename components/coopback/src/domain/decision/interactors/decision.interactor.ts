import { Cooperative } from 'cooptypes';
import { DocumentDomainService } from '~/domain/document/services/document-domain.service';
import { DocumentDomainEntity } from '~/domain/document/entity/document-domain.entity';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import type { CreateProjectFreeDecisionInputDomainInterface } from '../interfaces/create-project-free-decision.interface';
import config from '~/config/config';
import { DECISION_BLOCKCHAIN_PORT, DecisionBlockchainPort } from '../interfaces/decision-blockchain.port';

@Injectable()
export class DecisionDomainInteractor {
  constructor(
    private readonly documentDomainService: DocumentDomainService,
    @Inject(DECISION_BLOCKCHAIN_PORT) private readonly decisionBlockchainPort: DecisionBlockchainPort
  ) {}

  async generateProjectOfFreeDecisionDocument(
    data: Cooperative.Registry.ProjectFreeDecision.Action,
    options: Cooperative.Document.IGenerationOptions
  ): Promise<DocumentDomainEntity> {
    data.registry_id = Cooperative.Registry.ProjectFreeDecision.registry_id;
    return await this.documentDomainService.generateDocument({ data, options });
  }

  async publishProjectOfFreeDecision(data: CreateProjectFreeDecisionInputDomainInterface): Promise<boolean> {
    const document = await this.documentDomainService.getDocumentByHash(data.document.hash);

    if (!document) throw new BadRequestException('Документ не найден');

    if (data.document.meta.registry_id != Cooperative.Registry.ProjectFreeDecision.registry_id)
      throw new BadRequestException('Неверный registry_id в переданном документе, ожидается registry_id == 101');

    if (data.coopname != config.coopname)
      throw new BadRequestException('Указанное имя аккаунта кооператива не обслуживается здесь');

    await this.decisionBlockchainPort.publichProjectOfFreeDecision({
      coopname: data.coopname,
      username: data.username,
      meta: data.meta,
      document: { ...data.document, meta: JSON.stringify(data.document.meta) },
    });

    return true;
  }
}
