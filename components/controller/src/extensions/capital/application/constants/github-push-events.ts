/**
 * Событие: выложить снапшот проекта в GitHub после мутации через API/UI.
 * Не использовать с дельт парсера — иначе дубль пушей с syncProject.
 */
export const CAPITAL_PROJECT_GITHUB_PUSH_EVENT = 'capital.project.github_push' as const;
