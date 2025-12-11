import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { SovietContract } from 'cooptypes';
import {
  EXTENSION_REPOSITORY,
  ExtensionDomainRepository,
} from '~/domain/extension/repositories/extension-domain.repository';
import type { IConfig } from '../../chairman-extension.module';
import type { ExtensionDomainEntity } from '~/domain/extension/entities/extension-domain.entity';
import type { ActionDomainInterface } from '~/domain/parser/interfaces/action-domain.interface';
import { WinstonLoggerService } from '~/application/logger/logger-app.service';

@Injectable()
export class ChairmanOnboardingEventsService {
  constructor(
    @Inject(EXTENSION_REPOSITORY) private readonly extensionRepository: ExtensionDomainRepository<IConfig>,
    private readonly logger: WinstonLoggerService
  ) {
    this.logger.setContext(ChairmanOnboardingEventsService.name);
  }

  private async load(): Promise<ExtensionDomainEntity<IConfig> | null> {
    return this.extensionRepository.findByName('chairman');
  }

  private isExpired(config: IConfig): boolean {
    if (!config.onboarding_expire_at) return false;
    return new Date(config.onboarding_expire_at).getTime() < Date.now();
  }

  // Сравниваем пришедший hash с ожидаемыми и отмечаем шаги выполненными (hash не очищаем, чтобы видеть источник)
  private async tryMatchHash(hash: string): Promise<void> {
    const plugin = await this.load();
    if (!plugin) return;
    const cfg = { ...plugin.config };
    if (this.isExpired(cfg)) return;

    const patch: Partial<IConfig> = {};
    const matches: Array<keyof IConfig> = [];

    const check = (hashKey: keyof IConfig, doneKey: keyof IConfig) => {
      const storedHash = (cfg as any)[hashKey] as string | undefined;
      if (storedHash && storedHash === hash) {
        (patch as any)[doneKey] = true;
        // сохраняем хэш явно, чтобы не потерять его при обновлении
        (patch as any)[hashKey] = storedHash;
        matches.push(doneKey);
      }
    };

    check('onboarding_wallet_agreement_hash', 'onboarding_wallet_agreement_done');
    check('onboarding_signature_agreement_hash', 'onboarding_signature_agreement_done');
    check('onboarding_privacy_agreement_hash', 'onboarding_privacy_agreement_done');
    check('onboarding_user_agreement_hash', 'onboarding_user_agreement_done');
    check('onboarding_participant_application_hash', 'onboarding_participant_application_done');
    check('onboarding_voskhod_membership_hash', 'onboarding_voskhod_membership_done');
    check('onboarding_general_meet_hash', 'onboarding_general_meet_done');

    if (matches.length === 0) return;

    const updated: ExtensionDomainEntity<IConfig> = { ...plugin, config: { ...cfg, ...patch } };
    await this.extensionRepository.update(updated);
    this.logger.log(`Онбординг обновлён по hash ${hash}, отмечены: ${matches.join(', ')}`);
  }

  @OnEvent(`action::${SovietContract.contractName.production}::${SovietContract.Actions.Registry.NewResolved.actionName}`)
  async handleNewResolved(actionData: ActionDomainInterface): Promise<void> {
    const data: any = actionData.data;
    const docHash =
      data?.document?.hash ||
      data?.doc_hash ||
      data?.meta?.hash ||
      data?.hash ||
      (data?.documents && data.documents[0]?.hash) ||
      '';

    if (!docHash) return;
    await this.tryMatchHash(String(docHash));
  }
}
