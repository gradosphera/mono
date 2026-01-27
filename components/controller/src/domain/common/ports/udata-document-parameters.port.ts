/**
 * Порт для работы с параметрами документов в Udata
 */
export interface UdataDocumentParametersPort {
  /**
   * Генерирует и сохраняет параметры для оферты Благорост
   */
  generateBlagorostOfferParameters(coopname: string, username: string): Promise<void>;

  /**
   * Генерирует и сохраняет параметры для оферты Генератор
   */
  generateGeneratorOfferParameters(coopname: string, username: string): Promise<void>;

  /**
   * Генерирует и сохраняет параметры для договора УХД (Generation Contract)
   */
  generateGenerationContractParameters(coopname: string, username: string): Promise<void>;

  /**
   * Генерирует и сохраняет параметры для соглашения о хранении
   */
  generateStorageAgreementParameters(coopname: string, username: string): Promise<void>;

  /**
   * Генерирует и сохраняет параметры для соглашения Благорост (если еще не существуют)
   * Используется для пути Генератора
   */
  generateBlagorostAgreementParametersIfNotExist(coopname: string, username: string): Promise<void>;
}

/**
 * Символ для dependency injection
 */
export const UDATA_DOCUMENT_PARAMETERS_PORT = Symbol('UdataDocumentParametersPort');