// Определение базового интерфейса для мета-информации
export interface IMetaDocumentDomainInterface {
  title: string;
  registry_id: number;
  lang: string;
  generator: string;
  version: string;
  coopname: string;
  username: string;
  created_at: string;
  block_num: number;
  timezone: string;
  links: string[];
}
