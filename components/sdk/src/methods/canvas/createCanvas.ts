/**
 * Создаёт элемент `<canvas>` внутри указанного контейнера и возвращает его вместе с 2D контекстом.
 * 
 * @param container - HTML-элемент, внутри которого создаётся canvas.
 * @param width - Ширина canvas (по умолчанию 300).
 * @param height - Высота canvas (по умолчанию 150).
 * @returns Объект `{ canvas, ctx }`, где `canvas` — сам элемент, `ctx` — контекст 2D.
 * 
 * @example
 * ```ts
 * const { canvas, ctx } = Methods.Canvas.createCanvas(document.body, 500, 300)
 * console.log(canvas.width, canvas.height) // 500, 300
 * ```
 */
export function createCanvas(
  container: HTMLElement,
  width = 300,
  height = 150
): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  container.appendChild(canvas)
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D

  ctx.lineWidth = 5
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'
  ctx.strokeStyle = '#000'

  return { canvas, ctx }
}
