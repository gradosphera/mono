/**
 * События связки Capital-проектов с Matrix (ChatCoop).
 * Общий контракт без Nest-импорта модулей расширений друг в друга.
 */
export const CAPITAL_PROJECT_CREATED_EVENT = 'capital.project.created' as const;

export const CAPITAL_PROJECT_MATRIX_ROOM_ASSIGNED_EVENT = 'capital.project.matrix_room_assigned' as const;

/** Данные для ChatCoop без импорта доменной сущности Capital */
export interface ICapitalProjectCreatedPayload {
  project_hash: string;
  title: string;
}

export interface ICapitalProjectMatrixRoomAssignedPayload {
  project_hash: string;
  matrix_room_id: string;
}
