import { Cooperative } from 'cooptypes';
import { DocumentDomainService } from '~/domain/document/services/document-domain.service';
import { DocumentDomainEntity } from '~/domain/document/entity/document-domain.entity';
import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import type { AddParticipantDomainInterface } from '../interfaces/add-participant-domain.interface';
import type { RegisterAccountDomainInterface } from '~/domain/account/interfaces/register-account-input.interface';
import { AccountDomainService } from '~/domain/account/services/account-domain.service';
import type { AccountDomainEntity } from '~/domain/account/entities/account-domain.entity';
import config from '~/config/config';
import { userService } from '~/services';
import { TokenApplicationService } from '~/application/token/services/token-application.service';
import type { RegisterParticipantDomainInterface } from '../interfaces/register-participant-domain.interface';
import { CANDIDATE_REPOSITORY, CandidateRepository } from '~/domain/account/repository/candidate.repository';
import { userStatus } from '~/types/user.types';
import ApiError from '~/utils/ApiError';
import http from 'http-status';
import { PublicKey, Signature } from '@wharfkit/antelope';
import { ISignedDocumentDomainInterface } from '~/domain/document/interfaces/signed-document-domain.interface';
import { GatewayInteractor } from '~/domain/gateway/interactors/gateway.interactor';
import type { CreateInitialPaymentInputDomainInterface } from '~/domain/gateway/interfaces/create-initial-payment-input-domain.interface';
import { PaymentDomainEntity } from '~/domain/gateway/entities/payment-domain.entity';
import {
  NOTIFICATION_DOMAIN_SERVICE,
  NotificationDomainService,
} from '~/domain/notification/services/notification-domain.service';
import { NotificationSenderService } from '~/application/notification/services/notification-sender.service';
import { Workflows } from '@coopenomics/notifications';
import {
  DOCUMENT_VALIDATION_SERVICE,
  DocumentValidationService,
  type IDocumentToValidate,
} from '~/domain/document/services/document-validation.service';
import {
  AgreementConfigurationService,
  AGREEMENT_CONFIGURATION_SERVICE,
} from '~/domain/registration/services/agreement-configuration.service';
import { AccountType } from '~/application/account/enum/account-type.enum';

@Injectable()
export class ParticipantDomainInteractor {
  private readonly logger = new Logger(ParticipantDomainInteractor.name);

  constructor(
    private readonly documentDomainService: DocumentDomainService,
    private readonly accountDomainService: AccountDomainService,
    @Inject(CANDIDATE_REPOSITORY) private readonly candidateRepository: CandidateRepository,
    private readonly gatewayInteractor: GatewayInteractor,
    @Inject(NOTIFICATION_DOMAIN_SERVICE) private readonly notificationDomainService: NotificationDomainService,
    private readonly notificationSenderService: NotificationSenderService,
    @Inject(forwardRef(() => DOCUMENT_VALIDATION_SERVICE))
    private readonly documentValidationService: DocumentValidationService,
    @Inject(AGREEMENT_CONFIGURATION_SERVICE)
    private readonly agreementConfigurationService: AgreementConfigurationService,
    private readonly tokenApplicationService: TokenApplicationService
  ) {}

  async generateParticipantApplication(
    data: Cooperative.Registry.ParticipantApplication.Action,
    options: Cooperative.Document.IGenerationOptions
  ): Promise<DocumentDomainEntity> {
    data.registry_id = Cooperative.Registry.ParticipantApplication.registry_id;
    return await this.documentDomainService.generateDocument({ data, options });
  }

  async generateParticipantApplicationDecision(
    data: Cooperative.Registry.DecisionOfParticipantApplication.Action,
    options: Cooperative.Document.IGenerationOptions
  ): Promise<DocumentDomainEntity> {
    data.registry_id = Cooperative.Registry.DecisionOfParticipantApplication.registry_id;
    return await this.documentDomainService.generateDocument({ data, options });
  }

  /**
   * Проверяет подпись документа
   * @private
   */
  private verifyDocumentSignature(public_key: string, document: ISignedDocumentDomainInterface): void {
    const { signatures } = document;
    const doc_public_key = signatures[0].public_key;
    const signature = signatures[0].signature;
    const signed_hash = signatures[0].signed_hash;
    const publicKeyObj = PublicKey.from(doc_public_key);
    const signatureObj = Signature.from(signature);

    const verified: boolean = signatureObj.verifyDigest(signed_hash, publicKeyObj);
    if (!verified) {
      throw new ApiError(http.INTERNAL_SERVER_ERROR, 'Недействительная подпись');
    }

    if (public_key !== doc_public_key) throw new ApiError(http.BAD_REQUEST, 'Несовпадение публичных ключей');
  }

  async registerParticipant(data: RegisterParticipantDomainInterface): Promise<AccountDomainEntity> {
    // Получаем информацию о пользователе
    const user = await userService.getUserByUsername(data.username);

    if (!user) {
      throw new ApiError(http.NOT_FOUND, 'Пользователь не найден');
    }

    if (user.status !== userStatus['1_Created'] && user.status !== userStatus['2_Joined']) {
      throw new ApiError(http.NOT_FOUND, 'Пользователь уже вступил в кооператив');
    }

    // Получаем кандидата из репозитория
    const candidate = await this.candidateRepository.findByUsername(data.username);

    if (!candidate) {
      this.logger.error(`Кандидат с именем ${data.username} не найден`);
      throw new ApiError(http.NOT_FOUND, 'Кандидат не найден');
    }

    // ПРОВЕРКА 1: Сверка типа аккаунта
    // Проверяем, что в заявлении указан тот же тип аккаунта, что и у кандидата
    const statementMeta = data.statement.meta as any;
    if (statementMeta?.participant_data?.type && statementMeta.participant_data.type !== candidate.type) {
      throw new ApiError(
        http.BAD_REQUEST,
        `Тип аккаунта в заявлении (${statementMeta.participant_data.type}) не совпадает с типом зарегистрированного кандидата (${candidate.type})`
      );
    }

    // Подготавливаем структуру для валидации документов с использованием нового сервиса
    const documentsToValidate: IDocumentToValidate[] = [
      { id: 'statement', document: data.statement },
      { id: 'wallet_agreement', document: data.wallet_agreement },
      { id: 'user_agreement', document: data.user_agreement },
      { id: 'privacy_agreement', document: data.privacy_agreement },
      { id: 'signature_agreement', document: data.signature_agreement },
    ];

    // Добавляем capitalization_agreement если есть
    if (data.capitalization_agreement) {
      documentsToValidate.push({ id: 'capitalization_agreement', document: data.capitalization_agreement });
    }

    // Валидируем документы с проверкой оригиналов в базе
    const validationResults = await this.documentValidationService.validateRegistrationDocuments(documentsToValidate);

    if (!this.documentValidationService.allDocumentsValid(validationResults)) {
      const errors = this.documentValidationService.getErrorMessages(validationResults);
      this.logger.error(`Ошибка валидации документов: ${errors.join('; ')}`);
      throw new ApiError(http.BAD_REQUEST, `Ошибка валидации документов: ${errors.join('; ')}`);
    }

    // ПРОВЕРКА 2: Все ли требуемые соглашения предоставлены?
    // Проверяем наличие всех обязательных соглашений для типа аккаунта кандидата
    const requiredAgreements = this.agreementConfigurationService.getRequiredAgreementIds(
      candidate.type as AccountType,
      config.coopname
    );

    const missingAgreements: string[] = [];
    for (const agreementId of requiredAgreements) {
      const agreementData = data[agreementId];
      if (!agreementData) {
        missingAgreements.push(agreementId);
      }
    }

    if (missingAgreements.length > 0) {
      throw new ApiError(
        http.BAD_REQUEST,
        `Отсутствуют обязательные соглашения для типа аккаунта "${candidate.type}": ${missingAgreements.join(', ')}`
      );
    }

    // ПРОВЕРКА 3: Проверка линкованных документов в заявлении
    const statementLinks = (data.statement.meta as any)?.links || [];
    const expectedLinks = [
      data.wallet_agreement.doc_hash,
      data.signature_agreement.doc_hash,
      data.privacy_agreement.doc_hash,
      data.user_agreement.doc_hash,
    ];

    if (data.capitalization_agreement) {
      expectedLinks.push(data.capitalization_agreement.doc_hash);
    }

    // Проверяем, что все ожидаемые хеши присутствуют в заявлении
    const missingLinks = expectedLinks.filter((hash) => !statementLinks.includes(hash));

    if (missingLinks.length > 0) {
      throw new ApiError(
        http.BAD_REQUEST,
        `В заявлении отсутствуют ссылки на следующие документы: ${missingLinks.join(', ')}`
      );
    }

    // Сохраняем документы в репозиторий кандидатов
    await this.candidateRepository.saveDocument(data.username, 'statement', data.statement);
    await this.candidateRepository.saveDocument(data.username, 'wallet_agreement', data.wallet_agreement);
    await this.candidateRepository.saveDocument(data.username, 'privacy_agreement', data.privacy_agreement);
    await this.candidateRepository.saveDocument(data.username, 'signature_agreement', data.signature_agreement);
    await this.candidateRepository.saveDocument(data.username, 'user_agreement', data.user_agreement);

    // Сохраняем capitalization_agreement если есть
    if (data.capitalization_agreement) {
      await this.candidateRepository.saveDocument(data.username, 'capitalization_agreement', data.capitalization_agreement);
    }

    await this.candidateRepository.update(data.username, {
      braname: data.braname,
    });

    // Обновляем статус пользователя
    await userService.updateUserByUsername(data.username, {
      status: userStatus['2_Joined'],
    });

    this.logger.log(`Успешно зарегистрированы документы для кандидата ${data.username}`);

    return await this.accountDomainService.getAccount(data.username);
  }

  async addParticipant(data: AddParticipantDomainInterface): Promise<AccountDomainEntity> {
    const newAccount: RegisterAccountDomainInterface = {
      ...data,
      public_key: '',
      username: data.username,
    };

    await this.accountDomainService.addProviderAccount(newAccount);

    // Настраиваем подписчика NOVU для участника
    try {
      await this.accountDomainService.setupNotificationSubscriber(data.username, 'участника');
    } catch (error: any) {
      this.logger.error(`Ошибка настройки подписчика NOVU для участника ${data.username}: ${error.message}`, error.stack);
    }

    await this.accountDomainService.addParticipantAccount({
      referer: data.referer ? data.referer : '',
      coopname: config.coopname,
      meta: '',
      username: data.username,
      type: data.type,
      created_at: data.created_at,
      initial: data.initial,
      minimum: data.minimum,
      spread_initial: data.spread_initial,
    });

    //TODO move it to hexagon services

    const user = await userService.getUserByEmail(data.email);
    if (!user) {
      throw new ApiError(http.NOT_FOUND, 'Пользователь не найден');
    }
    const token = await this.tokenApplicationService.generateInviteToken(data.email, user.id);
    const inviteUrl = `${config.base_url}/${config.coopname}/auth/invite?token=${token}`;

    await this.notificationSenderService.sendNotificationToUser(data.username, Workflows.Invite.id, { inviteUrl });

    return this.accountDomainService.getAccount(data.username);
  }

  /**
   * Создать регистрационный платеж
   */
  async createInitialPayment(data: CreateInitialPaymentInputDomainInterface): Promise<PaymentDomainEntity> {
    return await this.gatewayInteractor.createInitialPayment(data);
  }
}
