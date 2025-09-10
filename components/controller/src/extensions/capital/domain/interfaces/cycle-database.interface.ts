import type { CycleStatus } from '../enums/cycle-status.enum';

/**
 * Интерфейс данных цикла из базы данных
 */
export interface ICycleDatabaseData {
  _id: string; // Внутренний ID базы данных
  name: string; // Название цикла
  start_date: Date; // Дата начала
  end_date: Date; // Дата окончания
  status: CycleStatus; // Статус цикла
}
