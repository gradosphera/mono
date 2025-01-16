/**
 * Класс `Canvas` инкапсулирует работу с HTML5 `<canvas>`:
 * - создание и инициализация canvas внутри переданного контейнера;
 * - очистка canvas;
 * - управление процессом рисования (начало, рисование, завершение);
 * - получение содержимого (подписи) в формате base64.
 *
 * @remarks
 * Все методы и состояние рисования (координаты, флаг `drawing`) хранятся внутри класса.
 *
 * @example
 * ```ts
 * const container = document.getElementById('canvas-container') as HTMLElement
 * const myCanvas = new Canvas(container, 500, 300)
 *
 * // События мыши
 * myCanvas.canvas.addEventListener('mousedown', (e) => myCanvas.startDrawing(e))
 * myCanvas.canvas.addEventListener('mousemove', (e) => myCanvas.draw(e))
 * myCanvas.canvas.addEventListener('mouseup', () => myCanvas.endDrawing())
 *
 * // Очистка холста
 * document.getElementById('clear-btn')?.addEventListener('click', () => {
 *   myCanvas.clearCanvas()
 * })
 *
 * // Получение подписи (base64)
 * document.getElementById('get-sign-btn')?.addEventListener('click', () => {
 *   const signature = myCanvas.getSignature()
 *   console.log('Подпись (base64):', signature)
 * })
 * ```
 */
export class Canvas {
  public canvas: HTMLCanvasElement
  public ctx: CanvasRenderingContext2D

  private state: {
    drawing: boolean
    lastX: number
    lastY: number
  } = {
      drawing: false,
      lastX: 0,
      lastY: 0,
    }

  /**
   * Создаёт элемент `<canvas>` внутри указанного контейнера.
   * @param container - HTML-элемент, внутри которого создаётся canvas.
   * @param width - Ширина canvas (по умолчанию 300).
   * @param height - Высота canvas (по умолчанию 150).
   */
  constructor(container: HTMLElement, width = 300, height = 150) {
    this.canvas = document.createElement('canvas')
    this.canvas.width = width
    this.canvas.height = height
    container.appendChild(this.canvas)
    this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D

    this.ctx.lineWidth = 5
    this.ctx.lineJoin = 'round'
    this.ctx.lineCap = 'round'
    this.ctx.strokeStyle = '#000'
  }

  /**
   * Полностью очищает canvas.
   */
  public clearCanvas(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }

  /**
   * Запускает процесс рисования (фиксирует начальные координаты).
   * @param e - Событие мыши или касания.
   */
  public startDrawing(e: MouseEvent | TouchEvent): void {
    e.preventDefault()
    this.state.drawing = true
    const rect = this.canvas.getBoundingClientRect()
    const clientX = e instanceof MouseEvent ? e.clientX : e.touches[0].clientX
    const clientY = e instanceof MouseEvent ? e.clientY : e.touches[0].clientY
    this.state.lastX = clientX - rect.left
    this.state.lastY = clientY - rect.top
  }

  /**
   * Выполняет рисование линии от предыдущей точки к текущей.
   * @param e - Событие мыши или касания.
   */
  public draw(e: MouseEvent | TouchEvent): void {
    if (!this.state.drawing)
      return
    e.preventDefault()

    this.ctx.beginPath()
    this.ctx.moveTo(this.state.lastX, this.state.lastY)

    const rect = this.canvas.getBoundingClientRect()
    const clientX = e instanceof MouseEvent ? e.clientX : e.touches[0].clientX
    const clientY = e instanceof MouseEvent ? e.clientY : e.touches[0].clientY
    const x = clientX - rect.left
    const y = clientY - rect.top

    this.ctx.lineTo(x, y)
    this.ctx.stroke()

    this.state.lastX = x
    this.state.lastY = y
  }

  /**
   * Завершает процесс рисования (drawing = false).
   */
  public endDrawing(): void {
    this.state.drawing = false
  }

  /**
   * Возвращает текущее содержимое canvas в формате base64 (PNG).
   */
  public getSignature(): string {
    return this.canvas.toDataURL('image/png')
  }
}
