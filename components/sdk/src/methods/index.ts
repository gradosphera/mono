/**
 * Namespace: Canvas
 * 
 * Набор функций для работы с HTML5 canvas, позволяющий:
 * - создать и инициализировать canvas внутри указанного элемента;
 * - очистить canvas;
 * - извлечь подпись (изображение) в формате base64;
 * - управлять процессом рисования (начало, отрисовка, завершение).
 * 
 * Данный набор функций подходит для использования в браузерной среде.
 * 
 * Пример использования:
 * 
 * ```ts
 * import { Methods } from '@coopenomics/sdk'
 * 
 * // Создаём canvas в div с id="canvas-container"
 * const container = document.getElementById('canvas-container') as HTMLElement
 * const { canvas, ctx } = Methods.Canvas.createCanvas(container, 500, 300)
 * 
 * // Объект состояния рисования
 * const drawingState: Canvas.DrawingState = {
 *   drawing: false,
 *   lastX: 0,
 *   lastY: 0
 * }
 * 
 * // Добавляем обработчики событий для рисования
 * canvas.addEventListener('mousedown', (e) => {
 *   Methods.Canvas.startDrawing(e, canvas, drawingState)
 * })
 * canvas.addEventListener('mousemove', (e) => {
 *   Methods.Canvas.draw(e, canvas, ctx, drawingState)
 * })
 * canvas.addEventListener('mouseup', () => {
 *   Methods.Canvas.endDrawing(drawingState)
 * })
 * 
 * // Очистка canvas
 * document.getElementById('clear-btn')?.addEventListener('click', () => {
 *   Methods.Canvas.clearCanvas(canvas, ctx)
 * })
 * 
 * // Получение подписи в base64
 * document.getElementById('get-sign-btn')?.addEventListener('click', () => {
 *   const signature = Methods.Canvas.getSignature(canvas)
 *   console.log('Подпись (base64):', signature)
 * })
 * ```
 */
export * as Canvas from './canvas'