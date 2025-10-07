import { registerEnumType } from '@nestjs/graphql';

/**
 * Перечисление статусов сегментов участника в проекте
 * Синхронизировано с константами из segments.hpp блокчейн контракта
 */
export enum SegmentStatus {
  GENERATION = 'generation', // Сегмент находится в стадии генерации
  READY = 'ready', // Сегмент готов к использованию
  CONTRIBUTED = 'contributed', // Участник внес вклад
  ACCEPTED = 'accepted', // Вклад принят
  COMPLETED = 'completed', // Сегмент завершен
  UNDEFINED = 'undefined', // Неопределенный статус
}

registerEnumType(SegmentStatus, {
  name: 'SegmentStatus',
  description: 'Статус сегмента участника в проекте CAPITAL',
});
