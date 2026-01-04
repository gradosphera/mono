/**
 * Типы событий в системе логирования CAPITAL
 * Каждый тип представляет отдельное действие, которое логируется в системе
 */
export enum LogEventType {
  /** Добавлен соавтор в проект/компонент */
  AUTHOR_ADDED = 'author_added',

  /** Создан проект */
  PROJECT_CREATED = 'project_created',

  /** Создан компонент (если есть родительский project_hash) */
  COMPONENT_CREATED = 'component_created',

  /** Получен коммит исполнителя */
  COMMIT_RECEIVED = 'commit_received',

  /** Получена инвестиция в компонент */
  INVESTMENT_RECEIVED = 'investment_received',

  /** Назначен мастер на проект */
  PROJECT_MASTER_ASSIGNED = 'project_master_assigned',

  /** Назначен мастер на компонент */
  COMPONENT_MASTER_ASSIGNED = 'component_master_assigned',

  /** Получен взнос результатом на сумму */
  RESULT_CONTRIBUTION_RECEIVED = 'result_contribution_received',
}
