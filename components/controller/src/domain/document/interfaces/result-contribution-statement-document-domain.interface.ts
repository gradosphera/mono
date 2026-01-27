import type { ISignedDocumentDomainInterface } from './signed-document-domain.interface';

/**
 * Доменный интерфейс для документа заявления о взносе результатов
 * Расширяет базовый интерфейс подписанного документа специфическими полями
 */
export interface ResultContributionStatementDocumentDomainInterface extends ISignedDocumentDomainInterface {
  meta: ISignedDocumentDomainInterface['meta'] & {
    project_name: string;
    component_name: string;
    result_hash: string;
    percent_of_result: string;
    total_amount: string;
  };
}