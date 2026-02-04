import { Injectable, Inject } from '@nestjs/common';
import { APPENDIX_REPOSITORY, AppendixRepository } from '../../domain/repositories/appendix.repository';
import { AppendixStatus } from '../../domain/enums/appendix-status.enum';
import { WinstonLoggerService } from '~/application/logger/logger-app.service';
import { ActionDomainInterface } from '~/domain/parser/interfaces/action-domain.interface';
import { CapitalContract } from 'cooptypes';
import { CONTRIBUTOR_REPOSITORY, ContributorRepository } from '../../domain/repositories/contributor.repository';
import { ContributorDomainEntity } from '../../domain/entities/contributor.entity';
import { ContributorStatus } from '../../domain/enums/contributor-status.enum';
import { AccountDataPort, ACCOUNT_DATA_PORT } from '~/domain/account/ports/account-data.port';
import { generateRandomHash } from '~/utils/generate-hash.util';
import { config } from '~/config';

/**
 * Интерактор для управления одобрением/отклонением приложений
 */
@Injectable()
export class ClearanceManagementInteractor {
  constructor(
    @Inject(APPENDIX_REPOSITORY)
    private readonly appendixRepository: AppendixRepository,
    @Inject(CONTRIBUTOR_REPOSITORY)
    private readonly contributorRepository: ContributorRepository,
    @Inject(ACCOUNT_DATA_PORT)
    private readonly accountDataPort: AccountDataPort,
    private readonly logger: WinstonLoggerService
  ) {
    this.logger.setContext(ClearanceManagementInteractor.name);
  }

  /**
   * Обработать одобрение приложения
   */
  async handleConfirmClearance(actionData: ActionDomainInterface): Promise<void> {
    try {
      const { data, block_num } = actionData;
      const actionPayload = data as CapitalContract.Actions.ConfirmClearance.IConfirmClearance;

      this.logger.debug(`Обработка одобрения приложения ${actionPayload.appendix_hash} в блоке ${block_num}`);

      // Найти приложение по appendix_hash
      const appendix = await this.appendixRepository.findByAppendixHash(actionPayload.appendix_hash);

      if (!appendix) {
        this.logger.warn(`Приложение ${actionPayload.appendix_hash} не найдено для одобрения`);
        return;
      }

      // Обновить статус и блок
      appendix.status = AppendixStatus.CONFIRMED;
      appendix.block_num = block_num;

      // Сохранить изменения
      await this.appendixRepository.save(appendix);

      // STORY-001: Создать Contributor при подтверждении доступа к проекту
      await this.createContributorOnClearanceConfirmation(appendix);

      this.logger.debug(`Приложение ${actionPayload.appendix_hash} одобрено и создан Contributor`);
    } catch (error: any) {
      this.logger.error(`Ошибка при обработке одобрения приложения: ${error?.message}`, error?.stack);
    }
  }

  /**
   * Обработать отклонение приложения
   */
  async handleDeclineClearance(actionData: ActionDomainInterface): Promise<void> {
    try {
      const { data, block_num } = actionData;
      const actionPayload = data as CapitalContract.Actions.DeclineClearance.IDeclineClearance;

      this.logger.debug(`Обработка отклонения приложения ${actionPayload.appendix_hash} в блоке ${block_num}`);

      // Найти приложение по appendix_hash
      const appendix = await this.appendixRepository.findByAppendixHash(actionPayload.appendix_hash);

      if (!appendix) {
        this.logger.warn(`Приложение ${actionPayload.appendix_hash} не найдено для отклонения`);
        return;
      }

      // Обновить статус и блок
      appendix.status = AppendixStatus.DECLINED;
      appendix.block_num = block_num;

      // Сохранить изменения
      await this.appendixRepository.save(appendix);

      this.logger.debug(`Приложение ${actionPayload.appendix_hash} отклонено`);
    } catch (error: any) {
      this.logger.error(`Ошибка при обработке отклонения приложения: ${error?.message}`, error?.stack);
      throw error;
    }
  }

  /**
   * Создать Contributor при подтверждении доступа к проекту (appendix)
   * STORY-001: Изменение логики создания Contributor с "при первом вкладе" на "при подтверждении доступа"
   */
  private async createContributorOnClearanceConfirmation(appendix: any): Promise<void> {
    try {
      // Проверить, существует ли уже Contributor для этого пользователя
      const existingContributor = await this.contributorRepository.findByUsername(appendix.username);

      if (existingContributor) {
        this.logger.debug(`Contributor для пользователя ${appendix.username} уже существует`);
        return;
      }

      // Получить отображаемое имя из аккаунта
      const displayName = await this.accountDataPort.getDisplayName(appendix.username);

      // Создать данные для нового Contributor
      const contributorData = {
        _id: '', // будет сгенерирован автоматически
        block_num: appendix.block_num,
        present: true,
        coopname: config.coopname,
        username: appendix.username,
        contributor_hash: generateRandomHash(),
        status: ContributorStatus.APPROVED, // Устанавливаем APPROVED, так как доступ подтвержден
        _created_at: new Date(),
        _updated_at: new Date(),
        display_name: displayName,
        about: '',
        program_key: undefined, // Для участников через appendix program_key не определен
        blagorost_offer_hash: undefined,
        generator_offer_hash: undefined,
        generation_contract_hash: undefined,
        storage_agreement_hash: undefined,
        blagorost_agreement_hash: undefined,
      };

      // Создать Contributor
      const contributor = new ContributorDomainEntity(contributorData);
      await this.contributorRepository.create(contributor);

      this.logger.log(`Создан Contributor для пользователя ${appendix.username} при подтверждении доступа к проекту ${appendix.project_hash}`);
    } catch (error: any) {
      this.logger.error(`Ошибка при создании Contributor для пользователя ${appendix.username}: ${error.message}`, error.stack);
      // Не выбрасываем ошибку, чтобы не прерывать обработку confirmClearance
    }
  }
}
