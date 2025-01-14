/**
 * 
 * Определяет состояние процесса рисования.
 * 
 * - `drawing`: флаг, показывающий, активен ли процесс рисования.
 * - `lastX`: координата X последней точки рисования.
 * - `lastY`: координата Y последней точки рисования.
 */
export interface IDrawingState {
  drawing: boolean
  lastX: number
  lastY: number
}
