// infrastructure/events/events.service.ts

import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

/**
 * Сервис внутренней шины событий для блокчейн операций
 * Позволяет сервисам подписываться на события без прямых зависимостей
 */
@Injectable()
export class EventsService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  /**
   * Универсальный метод для публикации события с любым именем
   */
  emit(eventName: string, data: any): void {
    this.eventEmitter.emit(eventName, data);
  }
}
