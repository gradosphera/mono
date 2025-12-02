/**
 * Интерфейс данных для действия вступления в кооператив (joincoop)
 * Содержит информацию о новом пайщике и сумме взносов
 */
export interface JoinCoopDataInterface {
  /**
   * Имя аккаунта пайщика в системе
   */
  username: string;

  /**
   * Тип аккаунта: individual (физлицо), entrepreneur (ИП), organization (юрлицо)
   */
  account_type: 'individual' | 'entrepreneur' | 'organization';

  /**
   * Полное имя пайщика (для физлиц и ИП) или краткое наименование организации
   */
  full_name: string;

  /**
   * Сумма вступительного взноса (числовое значение без символа валюты)
   */
  initial_contribution: number;

  /**
   * Сумма минимального паевого взноса (числовое значение без символа валюты)
   */
  minimum_contribution: number;

  /**
   * Дата создания документа
   */
  created_at: string;
}
