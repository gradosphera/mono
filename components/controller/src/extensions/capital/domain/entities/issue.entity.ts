import { IssuePriority } from '../enums/issue-priority.enum';
import { IssueStatus } from '../enums/issue-status.enum';
import type { IIssueDatabaseData } from '../interfaces/issue-database.interface';
import { BaseDomainEntity } from './base.entity';

/**
 * Доменная сущность задачи
 *
 * Представляет задачу в системе управления задачами
 */
export class IssueDomainEntity extends BaseDomainEntity<IIssueDatabaseData> {
  // Специфичные поля для задачи
  public id: string; // Уникальный ID задачи в формате PREFIX-N (например, ABC-1)
  public issue_hash: string; // Хеш задачи для внешних ссылок
  public coopname: string; // Имя аккаунта кооператива
  public title: string; // Название задачи
  public description?: string; // Описание задачи
  public priority: IssuePriority; // Приоритет задачи
  public status: IssueStatus; // Статус задачи
  public estimate: number; // Оценка в story points или часах
  public sort_order: number; // Порядок сортировки
  public created_by: string; // ID создателя задачи (contributor)
  public submaster_hash?: string; // Хэш подмастерья (contributor)
  public creators_hashs: string[]; // Массив хэшей создателей (contributors)
  public project_hash: string; // Хеш проекта
  public cycle_id?: string; // ID цикла
  public metadata: {
    labels: string[];
    attachments: string[];
  }; // Метаданные задачи

  /**
   * Конструктор для создания доменной сущности
   *
   * @param databaseData - данные из базы данных
   */
  constructor(databaseData: IIssueDatabaseData) {
    // Вызываем конструктор базового класса
    super(databaseData, IssueStatus.BACKLOG);

    // Устанавливаем специфичные поля задачи
    this.id = databaseData.id;
    this.issue_hash = databaseData.issue_hash.toLowerCase();
    this.coopname = databaseData.coopname;
    this.title = databaseData.title;
    this.description = databaseData.description;
    this.priority = databaseData.priority;
    this.status = databaseData.status; // Переопределяем статус с правильным типом
    this.estimate = databaseData.estimate;
    this.sort_order = databaseData.sort_order;
    this.created_by = databaseData.created_by;
    this.creators_hashs = databaseData.creators_hashs;
    this.submaster_hash = databaseData.submaster_hash;
    this.project_hash = databaseData.project_hash.toLowerCase();
    this.cycle_id = databaseData.cycle_id;
    this.metadata = databaseData.metadata;
  }

  /**
   * Добавление подмастерья
   * Автоматически добавляет его в creators_hashs если его там нет
   */
  setSubmaster(submasterHash: string): void {
    this.submaster_hash = submasterHash;
    if (!this.creators_hashs.includes(submasterHash)) {
      this.creators_hashs.push(submasterHash);
    }
  }

  /**
   * Добавление создателя
   */
  addCreator(creatorHash: string): void {
    if (!this.creators_hashs.includes(creatorHash)) {
      this.creators_hashs.push(creatorHash);
    }
  }

  /**
   * Удаление создателя
   */
  removeCreator(creatorHash: string): void {
    this.creators_hashs = this.creators_hashs.filter((hash) => hash !== creatorHash);
    // Если удаляем подмастерья, то очищаем submaster_hash
    if (this.submaster_hash === creatorHash) {
      this.submaster_hash = undefined;
    }
  }
}
