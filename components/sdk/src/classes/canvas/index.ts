export class Canvas {
  public canvas: HTMLCanvasElement
  public ctx: CanvasRenderingContext2D

  private drawing = false
  private lastX = 0
  private lastY = 0

  constructor(
    private container: HTMLElement,
    private opts: {
      lineWidth?: number
      strokeStyle?: string
    } = {},
  ) {
    // Создаём <canvas> и добавляем в контейнер
    this.canvas = document.createElement('canvas')
    this.canvas.width = container.offsetWidth
    this.canvas.height = container.offsetHeight

    // Отключаем скролл при тачах
    this.canvas.style.touchAction = 'none'

    container.appendChild(this.canvas)

    // Получаем 2D-контекст
    const ctx = this.canvas.getContext('2d')
    if (!ctx) {
      throw new Error('Canvas not supported')
    }
    this.ctx = ctx

    // Настройки рисования
    this.ctx.lineWidth = this.opts.lineWidth ?? 5
    this.ctx.lineJoin = 'round'
    this.ctx.lineCap = 'round'
    this.ctx.strokeStyle = this.opts.strokeStyle ?? '#000'

    // Навешиваем события мыши и тач
    this.initEvents()
  }

  /**
   * Очистка холста.
   */
  public clearCanvas(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }

  /**
   * Получение подписи в формате base64.
   */
  public getSignature(): string {
    return this.canvas.toDataURL('image/png')
  }

  /**
   * Снятие всех слушателей.
   */
  public destroy(): void {
    this.canvas.removeEventListener('mousedown', this.onMouseDown)
    this.canvas.removeEventListener('mousemove', this.onMouseMove)
    this.canvas.removeEventListener('mouseup', this.onMouseUp)

    this.canvas.removeEventListener('touchstart', this.onTouchStart)
    this.canvas.removeEventListener('touchmove', this.onTouchMove)
    this.canvas.removeEventListener('touchend', this.onTouchEnd)
  }

  // Внутренние методы

  private initEvents() {
    this.canvas.addEventListener('mousedown', this.onMouseDown)
    this.canvas.addEventListener('mousemove', this.onMouseMove)
    this.canvas.addEventListener('mouseup', this.onMouseUp)

    this.canvas.addEventListener('touchstart', this.onTouchStart, { passive: false })
    this.canvas.addEventListener('touchmove', this.onTouchMove, { passive: false })
    this.canvas.addEventListener('touchend', this.onTouchEnd, { passive: false })
  }

  private onMouseDown = (e: MouseEvent) => {
    e.preventDefault()
    this.drawing = true
    const rect = this.canvas.getBoundingClientRect()
    this.lastX = e.clientX - rect.left
    this.lastY = e.clientY - rect.top
  }

  private onMouseMove = (e: MouseEvent) => {
    if (!this.drawing)
      return
    e.preventDefault()
    this.drawLine(e.clientX, e.clientY)
  }

  private onMouseUp = () => {
    this.drawing = false
  }

  private onTouchStart = (e: TouchEvent) => {
    e.preventDefault()
    this.drawing = true
    const rect = this.canvas.getBoundingClientRect()
    this.lastX = e.touches[0].clientX - rect.left
    this.lastY = e.touches[0].clientY - rect.top
  }

  private onTouchMove = (e: TouchEvent) => {
    if (!this.drawing)
      return
    e.preventDefault()
    const t = e.touches[0]
    this.drawLine(t.clientX, t.clientY)
  }

  private onTouchEnd = () => {
    this.drawing = false
  }

  private drawLine(clientX: number, clientY: number) {
    this.ctx.beginPath()
    this.ctx.moveTo(this.lastX, this.lastY)

    const rect = this.canvas.getBoundingClientRect()
    const x = clientX - rect.left
    const y = clientY - rect.top

    this.ctx.lineTo(x, y)
    this.ctx.stroke()

    this.lastX = x
    this.lastY = y
  }
}
