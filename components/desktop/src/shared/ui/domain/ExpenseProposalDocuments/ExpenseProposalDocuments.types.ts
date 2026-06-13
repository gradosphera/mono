/**
 * Минимальная форма агрегата документа (DocumentAggregate шасси) — только поля,
 * нужные для превью: заголовок, html и факт подписи. Типизируем локально, чтобы
 * доменный компонент не зависел от Zeus-типов конкретного стола.
 */
export interface ExpenseDocumentAggregate {
  hash?: string | null;
  document?: {
    signatures?: Array<{ signed_at?: string | null }> | null;
  } | null;
  rawDocument?: {
    html?: string | null;
    full_title?: string | null;
  } | null;
}

export interface ExpenseProposalDocumentsProps {
  /** Заявление пайщика о расходе (служебная записка, 2010). */
  statement?: ExpenseDocumentAggregate | null;
  /** Решение совета о расходе (протокол, 2011). */
  decision?: ExpenseDocumentAggregate | null;
}
