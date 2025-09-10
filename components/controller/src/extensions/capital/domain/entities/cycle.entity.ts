import { CycleStatus } from '../enums/cycle-status.enum';
import type { ICycleDatabaseData } from '../interfaces/cycle-database.interface';

/**
 * Доменная сущность цикла разработки
 *
 * Управляет циклами разработки проектов (спринтами)
 */
export class CycleDomainEntity {
  // Поля из базы данных
  public _id: string; // Внутренний ID базы данных
  public name: string; // Название цикла
  public start_date: Date; // Дата начала
  public end_date: Date; // Дата окончания
  public status: CycleStatus; // Статус цикла

  /**
   * Конструктор для создания доменной сущности
   *
   * @param databaseData - данные из базы данных
   */
  constructor(databaseData: ICycleDatabaseData) {
    // Данные из базы данных
    this._id = databaseData._id;
    this.name = databaseData.name;
    this.start_date = databaseData.start_date;
    this.end_date = databaseData.end_date;
    this.status = databaseData.status;
  }

  /**
   * Обновление данных сущности
   */
  update(data: Partial<ICycleDatabaseData>): void {
    if (data.name !== undefined) this.name = data.name;
    if (data.start_date !== undefined) this.start_date = data.start_date;
    if (data.end_date !== undefined) this.end_date = data.end_date;
    if (data.status !== undefined) this.status = data.status;
  }
}
