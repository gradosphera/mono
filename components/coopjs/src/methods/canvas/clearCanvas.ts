/**
 * Полностью очищает указанный canvas.
 * 
 * @param canvas - Элемент canvas, который необходимо очистить.
 * @param ctx - Контекст рисования canvas.
 * 
 * @example
 * ```ts
 * Methods.Canvas.clearCanvas(canvas, ctx)
 * ```
 */
export function clearCanvas(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): void {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}
