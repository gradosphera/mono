/**
 * Доменный интерфейс для отправки соглашения
 */
export interface SendAgreementDomainInterface {
  coopname: string;
  administrator: string;
  username: string;
  agreement_type: string;
  document: any; // SignedDigitalDocumentInputDTO
}

/**
 * Доменный интерфейс для подтверждения соглашения
 */
export interface ConfirmAgreementDomainInterface {
  coopname: string;
  administrator: string;
  username: string;
  agreement_id: string;
}

/**
 * Доменный интерфейс для отклонения соглашения
 */
export interface DeclineAgreementDomainInterface {
  coopname: string;
  administrator: string;
  username: string;
  agreement_id: string;
  comment: string;
}
