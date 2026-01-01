import { Injectable, Inject, Logger, forwardRef } from '@nestjs/common';
import { AgreementConfigurationService, AGREEMENT_CONFIGURATION_SERVICE } from './agreement-configuration.service';
import { DocumentInteractor } from '~/application/document/interactors/document.interactor';
import type { IAgreementConfigItem } from '../config/agreement-config.interface';
import type {
  IGenerateRegistrationDocumentsInput,
  IGenerateRegistrationDocumentsOutput,
  IGeneratedRegistrationDocument,
} from '../interfaces/registration-documents.interface';
import type { AccountType } from '~/application/account/enum/account-type.enum';

export const REGISTRATION_DOCUMENTS_SERVICE = Symbol('RegistrationDocumentsService');

/**
 * Сервис для генерации пакета документов при регистрации пайщика
 */
@Injectable()
export class RegistrationDocumentsService {
  private readonly logger = new Logger(RegistrationDocumentsService.name);

  constructor(
    @Inject(AGREEMENT_CONFIGURATION_SERVICE)
    private readonly agreementConfigService: AgreementConfigurationService,
    @Inject(forwardRef(() => DocumentInteractor))
    private readonly documentInteractor: DocumentInteractor
  ) {}

  /**
   * Генерирует пакет документов для регистрации пайщика
   * @param input - входные данные для генерации
   * @returns пакет сгенерированных документов с метаданными
   */
  async generateRegistrationDocuments(
    input: IGenerateRegistrationDocumentsInput
  ): Promise<IGenerateRegistrationDocumentsOutput> {
    const { coopname, username, account_type } = input;

    this.logger.log(`Начало генерации документов для регистрации: username=${username}, account_type=${account_type}`);

    // ВАЖНО: Проверяем, что запрашиваемый тип аккаунта совпадает с типом зарегистрированного кандидата
    // Эта проверка делается на уровне сервиса для ранней валидации
    // (дополнительная проверка также будет в registerParticipant)

    // Получаем список соглашений для данного типа аккаунта
    const agreementsConfig = this.agreementConfigService.getAgreementsForAccountType(account_type, coopname);

    this.logger.log(`Найдено ${agreementsConfig.length} соглашений для типа ${account_type} (кооператив: ${coopname})`);

    // Параллельно генерируем все документы
    const generationPromises = agreementsConfig.map((config) => this.generateSingleDocument(coopname, username, config));

    const documents = await Promise.all(generationPromises);

    this.logger.log(`Успешно сгенерировано ${documents.length} документов для ${username}`);

    return {
      documents,
      account_type,
      username,
    };
  }

  /**
   * Генерирует один документ на основе конфигурации
   */
  private async generateSingleDocument(
    coopname: string,
    username: string,
    config: IAgreementConfigItem
  ): Promise<IGeneratedRegistrationDocument> {
    this.logger.debug(`Генерация документа: ${config.id} (registry_id=${config.registry_id})`);

    const document = await this.documentInteractor.generateDocument({
      data: {
        coopname,
        username,
        registry_id: config.registry_id,
      },
      options: {
        skip_save: false, // Сохраняем документ в базу для последующей сверки
      },
    });

    return {
      id: config.id,
      agreement_type: config.agreement_type,
      title: config.title,
      checkbox_text: config.checkbox_text,
      link_text: config.link_text,
      document: {
        full_title: document.full_title,
        html: document.html,
        hash: document.hash,
        meta: document.meta,
        binary: document.binary,
      },
      is_blockchain_agreement: config.is_blockchain_agreement,
      link_to_statement: config.link_to_statement,
      order: config.order,
    };
  }

  /**
   * Получить список идентификаторов документов, которые нужно линковать в заявление
   * @param accountType - тип аккаунта
   * @param coopname - название кооператива (для временного исключения capitalization_agreement)
   * @returns массив id документов для линковки
   */
  getLinkedDocumentIds(accountType: AccountType, coopname?: string): string[] {
    return this.agreementConfigService.getLinkedAgreements(accountType, coopname).map((a) => a.id);
  }

  /**
   * Получить список идентификаторов документов, которые нужно отправить в блокчейн
   * @param accountType - тип аккаунта
   * @param coopname - название кооператива (для временного исключения capitalization_agreement)
   * @returns массив id документов для отправки в блокчейн
   */
  getBlockchainDocumentIds(accountType: AccountType, coopname?: string): string[] {
    return this.agreementConfigService.getBlockchainAgreements(accountType, coopname).map((a) => a.id);
  }
}
