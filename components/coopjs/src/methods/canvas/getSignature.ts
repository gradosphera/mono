/**
 * 
 * Извлекает текущее содержимое canvas в формате base64 (PNG).
 * 
 * @param canvas - Элемент canvas, из которого извлекается собственноручная подпись.
 * @returns Строка в формате base64, содержащая изображение.
 * 
 * @example
 * ```ts
 * const sign = Methods.Canvas.getSignature(canvas)
 * console.log(sign) // "data:image/png;base64,iVBORw0..."
 * ```
 */
export function getSignature(canvas: HTMLCanvasElement): string {
  return canvas.toDataURL('image/png');
}
