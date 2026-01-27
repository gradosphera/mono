import { ProgramKey } from '~/domain/registration/enum';

/**
 * Интерфейс события participant::registered
 * Эмитится после успешной регистрации участника
 */
export interface ParticipantRegisteredEvent {
  /** Имя пользователя */
  username: string;
  /** Ключ выбранной программы регистрации */
  program_key?: ProgramKey;
  /** Имя филиала */
  braname?: string;
  /** Тип аккаунта участника */
  account_type: string;
  /** Хэш оферты по капитализации (только для программы CAPITALIZATION) */
  blagorost_offer_hash?: string;
  /** Хэш оферты по генератору (только для программы GENERATION) */
  generator_offer_hash?: string;
}