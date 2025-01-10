import type { IDrawingState } from "./drawingState";

/**
 * 
 * Завершает процесс рисования, устанавливая `drawing = false`.
 * 
 * @param state - Объект состояния рисования.
 * 
 * @example
 * ```ts
 * canvas.addEventListener('mouseup', () => {
 *   Methods.Canvas.endDrawing(drawingState)
 * })
 * ```
 */
export function endDrawing(state: IDrawingState): void {
  state.drawing = false;
}
