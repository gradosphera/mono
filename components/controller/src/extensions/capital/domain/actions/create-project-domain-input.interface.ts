/**
 * Доменный интерфейс для действия создания проекта CAPITAL контракта
 */
export interface CreateProjectDomainInput {
  /** Имя аккаунта кооператива */
  coopname: string;

  /** Хэш проекта */
  project_hash: string;

  /** Хэш родительского проекта (или мета-проекта) */
  parent_hash: string;

  /** Название проекта */
  title: string;

  /** Описание проекта */
  description: string;

  /** Мета-данные проекта */
  meta: string;

  /** Флаг возможности конвертации в проект */
  can_convert_to_project: boolean;
}
