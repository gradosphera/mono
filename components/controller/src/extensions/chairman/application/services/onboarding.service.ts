import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import {
  EXTENSION_REPOSITORY,
  ExtensionDomainRepository,
} from '~/domain/extension/repositories/extension-domain.repository';
import type { ExtensionDomainEntity } from '~/domain/extension/entities/extension-domain.entity';
import {
  ChairmanOnboardingAgendaInputDTO,
  ChairmanOnboardingAgendaStepEnum,
  ChairmanOnboardingStateDTO,
} from '../dto/onboarding.dto';
import type { IConfig } from '../../chairman-extension.module';
import { FreeDecisionDomainInteractor } from '~/domain/free-decision/interactors/free-decision.interactor';
import { Cooperative } from 'cooptypes';
import config from '~/config/config';
import { MEET_EXTENSION_PORT, MeetExtensionPort } from '~/domain/extension/ports/meet-extension-port';
import type { ISignedDocumentDomainInterface } from '~/domain/document/interfaces/signed-document-domain.interface';

type OnboardingFlagKey =
  | 'onboarding_wallet_agreement_done'
  | 'onboarding_signature_agreement_done'
  | 'onboarding_privacy_agreement_done'
  | 'onboarding_user_agreement_done'
  | 'onboarding_participant_application_done'
  | 'onboarding_voskhod_membership_done'
  | 'onboarding_general_meet_done';

@Injectable()
export class ChairmanOnboardingService {
  constructor(
    @Inject(EXTENSION_REPOSITORY) private readonly extensionRepository: ExtensionDomainRepository<IConfig>,
    private readonly freeDecisionInteractor: FreeDecisionDomainInteractor,
    @Inject(MEET_EXTENSION_PORT) private readonly meetExtensionPort: MeetExtensionPort
  ) {}

  private mapStepToFlag(step: ChairmanOnboardingAgendaStepEnum): OnboardingFlagKey {
    switch (step) {
      case ChairmanOnboardingAgendaStepEnum.wallet_agreement:
        return 'onboarding_wallet_agreement_done';
      case ChairmanOnboardingAgendaStepEnum.signature_agreement:
        return 'onboarding_signature_agreement_done';
      case ChairmanOnboardingAgendaStepEnum.privacy_agreement:
        return 'onboarding_privacy_agreement_done';
      case ChairmanOnboardingAgendaStepEnum.user_agreement:
        return 'onboarding_user_agreement_done';
      case ChairmanOnboardingAgendaStepEnum.participant_application:
        return 'onboarding_participant_application_done';
      case ChairmanOnboardingAgendaStepEnum.voskhod_membership:
        return 'onboarding_voskhod_membership_done';
      default:
        throw new Error(`Неизвестный шаг онбординга: ${step}`);
    }
  }

  private mapStepToHash(step: ChairmanOnboardingAgendaStepEnum): keyof IConfig {
    switch (step) {
      case ChairmanOnboardingAgendaStepEnum.wallet_agreement:
        return 'onboarding_wallet_agreement_hash';
      case ChairmanOnboardingAgendaStepEnum.signature_agreement:
        return 'onboarding_signature_agreement_hash';
      case ChairmanOnboardingAgendaStepEnum.privacy_agreement:
        return 'onboarding_privacy_agreement_hash';
      case ChairmanOnboardingAgendaStepEnum.user_agreement:
        return 'onboarding_user_agreement_hash';
      case ChairmanOnboardingAgendaStepEnum.participant_application:
        return 'onboarding_participant_application_hash';
      case ChairmanOnboardingAgendaStepEnum.voskhod_membership:
        return 'onboarding_voskhod_membership_hash';
      default:
        throw new Error(`Неизвестный шаг онбординга: ${step}`);
    }
  }

  private async loadPlugin(): Promise<ExtensionDomainEntity<IConfig>> {
    const plugin = await this.extensionRepository.findByName('chairman');
    if (!plugin) throw new Error('Конфигурация расширения chairman не найдена');
    const config = { ...plugin.config };

    let needUpdate = false;
    if (!config.onboarding_init_at) {
      config.onboarding_init_at = new Date().toISOString();
      needUpdate = true;
    }

    if (!config.onboarding_expire_at) {
      const start = new Date(config.onboarding_init_at);
      const expire = new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000);
      config.onboarding_expire_at = expire.toISOString();
      needUpdate = true;
    }

    if (needUpdate) {
      await this.extensionRepository.update({ ...plugin, config });
      return { ...plugin, config };
    }

    return plugin;
  }

  private buildState(config: IConfig): ChairmanOnboardingStateDTO {
    return {
      wallet_agreement_done: !!config.onboarding_wallet_agreement_done,
      onboarding_wallet_agreement_hash: config.onboarding_wallet_agreement_hash || null,
      signature_agreement_done: !!config.onboarding_signature_agreement_done,
      onboarding_signature_agreement_hash: config.onboarding_signature_agreement_hash || null,
      privacy_agreement_done: !!config.onboarding_privacy_agreement_done,
      onboarding_privacy_agreement_hash: config.onboarding_privacy_agreement_hash || null,
      user_agreement_done: !!config.onboarding_user_agreement_done,
      onboarding_user_agreement_hash: config.onboarding_user_agreement_hash || null,
      participant_application_done: !!config.onboarding_participant_application_done,
      onboarding_participant_application_hash: config.onboarding_participant_application_hash || null,
      voskhod_membership_done: !!config.onboarding_voskhod_membership_done,
      onboarding_voskhod_membership_hash: config.onboarding_voskhod_membership_hash || null,
      general_meet_done: !!config.onboarding_general_meet_done,
      onboarding_general_meet_hash: config.onboarding_general_meet_hash || null,
      onboarding_init_at: config.onboarding_init_at || '',
      onboarding_expire_at: config.onboarding_expire_at || '',
    };
  }

  public async getState(): Promise<ChairmanOnboardingStateDTO> {
    const plugin = await this.loadPlugin();
    return this.buildState(plugin.config);
  }

  public async completeAgendaStep(
    data: ChairmanOnboardingAgendaInputDTO,
    username: string
  ): Promise<ChairmanOnboardingStateDTO> {
    const plugin = await this.loadPlugin();
    const flagKey = this.mapStepToFlag(data.step);
    const hashKey = this.mapStepToHash(data.step);
    const normalizedTitle = data.title?.trim().substring(0, 200) || undefined;

    if ((plugin.config as any)[flagKey]) {
      return this.buildState(plugin.config);
    }
    const project_id = uuid();
    const actor = username;

    await this.freeDecisionInteractor.createProjectOfFreeDecision({
      id: project_id,
      title: normalizedTitle,
      question: data.question,
      decision: data.decision,
    });
    console.log('data: ', data);
    // Генерируем документ проекта решения
    const generatedDoc = await this.freeDecisionInteractor.generateProjectOfFreeDecisionDocument(
      {
        project_id,
        coopname: config.coopname,
        username: actor,
        registry_id: Cooperative.Registry.ProjectFreeDecision.registry_id,
        title: normalizedTitle,
      },
      {}
    );

    // Публикуем проект решения в блокчейн сразу после генерации
    // TODO: ну это конечно убирать надо.
    const documentForPublish: ISignedDocumentDomainInterface = {
      version: (generatedDoc.meta as any)?.version || '1.0',
      hash: generatedDoc.hash,
      doc_hash: (generatedDoc.meta as any)?.doc_hash || generatedDoc.hash,
      meta_hash: (generatedDoc.meta as any)?.meta_hash || generatedDoc.hash,
      meta: generatedDoc.meta,
      signatures: (generatedDoc.meta as any)?.signatures || [],
    };

    console.dir(generatedDoc, { depth: null });

    await this.freeDecisionInteractor.publishProjectOfFreeDecision({
      coopname: config.coopname,
      username: actor,
      meta: JSON.stringify({ step: data.step, project_id, title: normalizedTitle }),
      document: documentForPublish,
    });

    const updatedConfig: IConfig = {
      ...plugin.config,
      [hashKey]: generatedDoc.hash,
    };
    await this.extensionRepository.update({ ...plugin, config: updatedConfig });

    return this.buildState(updatedConfig);
  }

  // Сохраняем hash повестки общего собрания, флаг закроется после newresolved
  public async completeGeneralMeet(proposal_hash: string, _username?: string): Promise<ChairmanOnboardingStateDTO> {
    const plugin = await this.loadPlugin();

    if (plugin.config.onboarding_general_meet_done) {
      return this.buildState(plugin.config);
    }
    console.log('proposal_hash: ', proposal_hash);

    // Если hash не пришёл (не должно быть), не затираем существующее значение
    const meetHash = proposal_hash || plugin.config.onboarding_general_meet_hash || '';

    const updatedConfig: IConfig = { ...plugin.config, onboarding_general_meet_hash: meetHash };
    await this.extensionRepository.update({ ...plugin, config: updatedConfig });

    return this.buildState(updatedConfig);
  }
}
