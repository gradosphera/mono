/**
 * Событие: выложить снапшот проекта в GitHub после мутации через API/UI.
 * Не использовать с дельт парсера — иначе дубль пушей с syncProject.
 */
export const CAPITAL_PROJECT_GITHUB_PUSH_EVENT = 'capital.project.github_push' as const;

/** Удаление проекта из кооператива — очистка дерева в GitHub (с учётом правил result/коммиты). */
export const CAPITAL_PROJECT_DELETED_GITHUB_SYNC_EVENT = 'capital.project.deleted_github_sync' as const;

/** Удаление задачи — удалить файл (и вложенные requirements) в GitHub. */
export const CAPITAL_ISSUE_DELETED_GITHUB_EVENT = 'capital.issue.deleted_github' as const;

/** Удаление требования — удалить файл в GitHub. */
export const CAPITAL_STORY_DELETED_GITHUB_EVENT = 'capital.story.deleted_github' as const;
