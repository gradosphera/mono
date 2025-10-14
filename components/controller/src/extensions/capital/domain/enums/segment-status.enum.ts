import { registerEnumType } from '@nestjs/graphql';

/**
 * Перечисление статусов сегментов участника в проекте
 * Синхронизировано с константами из segments.hpp блокчейн контракта
 */
export enum SegmentStatus {
  GENERATION = 'generation', // Сегмент находится в стадии генерации
  READY = 'ready', // Проект завершен, ожидает внесения результата
  CONTRIBUTED = 'contributed', // Результат внесён и принят советом
  UNDEFINED = 'undefined', // Неопределенный статус
}

registerEnumType(SegmentStatus, {
  name: 'SegmentStatus',
  description: 'Статус сегмента участника в проекте CAPITAL',
});
