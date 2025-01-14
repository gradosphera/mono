import type { IDrawingState } from "./drawingState";

/**
 * Function: draw
 * 
 * Выполняет рисование линии от предыдущей точки к текущей, обновляя координаты.
 * 
 * @param e - Событие мыши или касания.
 * @param canvas - Элемент canvas, на котором рисуется.
 * @param ctx - Контекст рисования.
 * @param state - Объект состояния рисования.
 * 
 * @example
 * ```ts
 * canvas.addEventListener('mousemove', (e) => {
 *   Methods.Canvas.draw(e, canvas, ctx, drawingState)
 * })
 * ```
 */
export function draw(
  e: MouseEvent | TouchEvent,
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  state: IDrawingState
): void {
  if (!state.drawing) return;
  e.preventDefault();
  ctx.beginPath();
  ctx.moveTo(state.lastX, state.lastY);

  const rect = canvas.getBoundingClientRect();
  const clientX = e instanceof MouseEvent ? e.clientX : e.touches[0].clientX;
  const clientY = e instanceof MouseEvent ? e.clientY : e.touches[0].clientY;
  const x = clientX - rect.left;
  const y = clientY - rect.top;

  ctx.lineTo(x, y);
  ctx.stroke();

  state.lastX = x;
  state.lastY = y;
}
