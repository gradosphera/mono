import type { AccountType } from '~/application/account/enum/account-type.enum';
import type { GeneratedDocumentDomainInterface } from '~/domain/document/interfaces/generated-document-domain.interface';
import { ProgramKey, type AgreementId, type AgreementType } from '../enum';

/**
 * Входные данные для генерации пакета документов при регистрации
 */
export interface IGenerateRegistrationDocumentsInput {
  /** Имя кооператива */
  coopname: string;
  /** Имя пользователя (аккаунт) */
  username: string;
  /** Тип аккаунта пайщика */
  account_type: AccountType;
  /** Ключ выбранной программы регистрации (опционально) */
  program_key?: ProgramKey;
}

/**
 * Сгенерированный документ регистрации с метаданными из конфигурации
 */
export interface IGeneratedRegistrationDocument {
  /** Идентификатор соглашения (wallet_agreement, signature_agreement, etc.) */
  id: AgreementId;
  /** Тип соглашения для блокчейна */
  agreement_type: AgreementType;
  /** Название документа */
  title: string;
  /** Текст для галочки на фронте */
  checkbox_text: string;
  /** Текст ссылки для открытия диалога чтения */
  link_text: string;
  /** Сгенерированный документ */
  document: GeneratedDocumentDomainInterface;
  /** Нужно ли отправлять в блокчейн как agreement */
  is_blockchain_agreement: boolean;
  /** Нужно ли линковать в заявление */
  link_to_statement: boolean;
  /** Порядок отображения */
  order: number;
}

/**
 * Результат генерации пакета документов при регистрации
 */
export interface IGenerateRegistrationDocumentsOutput {
  /** Массив сгенерированных документов с метаданными */
  documents: IGeneratedRegistrationDocument[];
  /** Тип аккаунта, для которого сгенерированы документы */
  account_type: AccountType;
  /** Имя пользователя */
  username: string;
}
