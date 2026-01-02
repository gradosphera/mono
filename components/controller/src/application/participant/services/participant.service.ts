import { Injectable, Inject } from '@nestjs/common';
import { GenerateDocumentOptionsInputDTO } from '~/application/document/dto/generate-document-options-input.dto';
import { ParticipantInteractor } from '../interactors/participant.interactor';
import {
  UserCertificateDomainPort,
  USER_CERTIFICATE_DOMAIN_PORT,
} from '~/domain/user/ports/user-certificate-domain.port';
import { ParticipantNotificationService } from './participant-notification.service';
import type { ParticipantApplicationGenerateDocumentInputDTO } from '../../document/documents-dto/participant-application-document.dto';
import type { ParticipantApplicationDecisionGenerateDocumentInputDTO } from '../../document/documents-dto/participant-application-decision-document.dto';
import type { AddParticipantInputDTO } from '../dto/add-participant-input.dto';
import { AccountDTO } from '~/application/account/dto/account.dto';
import { generateUsername } from '~/utils/generate-username';
import { RegisterRole } from '~/application/account/enum/account-role-on-register.enum';
import type { RegisterParticipantInputDTO } from '../dto/register-participant-input.dto';
import type { GeneratedDocumentDTO } from '~/application/document/dto/generated-document.dto';
import type { CreateInitialPaymentInputDTO } from '../../gateway/dto/create-initial-payment-input.dto';
import type { GatewayPaymentDTO } from '../../gateway/dto/gateway-payment.dto';

@Injectable()
export class ParticipantService {
  constructor(
    private readonly participantInteractor: ParticipantInteractor,
    @Inject(USER_CERTIFICATE_DOMAIN_PORT)
    private readonly userCertificateDomainPort: UserCertificateDomainPort,
    private readonly participantNotificationService: ParticipantNotificationService
  ) {}

  public async generateParticipantApplication(
    data: ParticipantApplicationGenerateDocumentInputDTO,
    options: GenerateDocumentOptionsInputDTO
  ): Promise<GeneratedDocumentDTO> {
    const document = await this.participantInteractor.generateParticipantApplication(data, options);
    return document as unknown as GeneratedDocumentDTO;
  }

  public async generateParticipantApplicationDecision(
    data: ParticipantApplicationDecisionGenerateDocumentInputDTO,
    options: GenerateDocumentOptionsInputDTO
  ): Promise<GeneratedDocumentDTO> {
    const document = await this.participantInteractor.generateParticipantApplicationDecision(data, options);
    return document as unknown as GeneratedDocumentDTO;
  }

  public async addParticipant(data: AddParticipantInputDTO): Promise<AccountDTO> {
    const result = await this.participantInteractor.addParticipant({
      ...data,
      username: generateUsername(),
      role: RegisterRole.User,
    });
    return new AccountDTO(result);
  }

  public async registerParticipant(data: RegisterParticipantInputDTO): Promise<AccountDTO> {
    const result = await this.participantInteractor.registerParticipant(data);

    // Отправляем приветственное уведомление после успешной регистрации
    await this.participantNotificationService.sendWelcomeNotification(data.username);

    return new AccountDTO(result);
  }

  /**
   * Создать регистрационный платеж
   */
  public async createInitialPayment(data: CreateInitialPaymentInputDTO): Promise<GatewayPaymentDTO> {
    const result = await this.participantInteractor.createInitialPayment(data);
    const usernameCertificate = await this.userCertificateDomainPort.getCertificateByUsername(result.username);

    // Отправляем уведомление председателю о новой заявке на вступительный взнос
    await this.participantNotificationService.sendNewInitialPaymentNotification(
      result.username,
      result.quantity.toFixed(2),
      result.symbol,
      result.coopname
    );

    return result.toDTO(usernameCertificate);
  }
}
