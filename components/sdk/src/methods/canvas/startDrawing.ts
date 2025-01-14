import type { IDrawingState } from "./drawingState";

/**
 * Запускает процесс рисования, фиксируя начальные координаты.
 * 
 * @param e - Событие мыши или касания.
 * @param canvas - Элемент canvas, на котором происходит рисование.
 * @param state - Объект состояния рисования.
 * 
 * @example
 * ```ts
 * canvas.addEventListener('mousedown', (e) => {
 *   Methods.Canvas.startDrawing(e, canvas, drawingState)
 * })
 * ```
 */
export function startDrawing(
  e: MouseEvent | TouchEvent,
  canvas: HTMLCanvasElement,
  state: IDrawingState
): void {
  e.preventDefault();
  state.drawing = true;
  const rect = canvas.getBoundingClientRect();
  const clientX = e instanceof MouseEvent ? e.clientX : e.touches[0].clientX;
  const clientY = e instanceof MouseEvent ? e.clientY : e.touches[0].clientY;
  state.lastX = clientX - rect.left;
  state.lastY = clientY - rect.top;
}
