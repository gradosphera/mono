/**
 * Платформенный порт проверки подписи on-chain соглашения пайщиком.
 *
 * Используется расширениями для L3-гейта (см. план C28-10 раздел 3):
 *   • capital → проверяет blagorost/generator перед инвестицией;
 *   • Стол заказов → проверяет order_table перед публикацией заказа.
 *
 * Контракт hasSigned:
 *   • true ↔ найдено соглашение (coopname, username, type) в любом
 *     статусе кроме DECLINED — REGISTERED уже достаточно для входа
 *     в расширение (CONFIRMED — после ратификации советом);
 *   • false при отсутствии записи или статусе DECLINED.
 *
 * Реализация — AgreementService через AGREEMENT_REPOSITORY (Postgres).
 */
export interface AgreementSignaturePort {
  hasSigned(coopname: string, username: string, agreement_type: string): Promise<boolean>;
}

/** DI-токен для AgreementSignaturePort при использовании через @Inject(). */
export const AGREEMENT_SIGNATURE_PORT = Symbol('AgreementSignaturePort');
