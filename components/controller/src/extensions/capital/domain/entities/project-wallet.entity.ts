import type { IProjectWalletDatabaseData } from '../interfaces/project-wallet-database.interface';
import type { IProjectWalletBlockchainData } from '../interfaces/project-wallet-blockchain.interface';
import type { IBlockchainSynchronizable } from '~/shared/interfaces/blockchain-sync.interface';
import { BaseDomainEntity } from '~/shared/sync/entities/base-domain.entity';
/**
 * Доменная сущность проектного кошелька
 *
 * Полностью агрегирует данные из двух источников:
 * - База данных: внутренний ID, ссылка на блокчейн
 * - Блокчейн: все данные проектного кошелька из таблицы projwallets
 */
export class ProjectWalletDomainEntity
  extends BaseDomainEntity<IProjectWalletDatabaseData>
  implements IBlockchainSynchronizable, Partial<IProjectWalletBlockchainData>
{
  // Статические поля ключей для поиска и синхронизации
  private static primary_key = 'id';
  private static sync_key = 'username';

  // Специфичные поля для project-wallet
  public id?: number; // ID в блокчейне

  // Поля из блокчейна (wallets.hpp)
  public username: IProjectWalletBlockchainData['username'];

  public coopname?: IProjectWalletBlockchainData['coopname'];
  public project_hash?: IProjectWalletBlockchainData['project_hash'];
  public shares?: IProjectWalletBlockchainData['shares'];
  public last_membership_reward_per_share?: IProjectWalletBlockchainData['last_membership_reward_per_share'];
  public membership_available?: IProjectWalletBlockchainData['membership_available'];

  /**
   * Конструктор для сборки композитной сущности
   *
   * @param databaseData - данные из базы данных
   * @param blockchainData - данные из блокчейна
   */
  constructor(databaseData: IProjectWalletDatabaseData, blockchainData?: IProjectWalletBlockchainData) {
    // Вызываем конструктор базового класса с данными
    super(databaseData);

    // Специфичные поля для project-wallet
    this.username = databaseData.username;

    // Данные из блокчейна
    if (blockchainData) {
      if (this.username != blockchainData.username) throw new Error('Project wallet username mismatch');

      this.id = Number(blockchainData.id);
      this.coopname = blockchainData.coopname;
      this.project_hash = blockchainData.project_hash.toLowerCase();
      this.username = blockchainData.username;
      this.shares = blockchainData.shares;
      this.last_membership_reward_per_share = blockchainData.last_membership_reward_per_share;
      this.membership_available = blockchainData.membership_available;
    }
  }

  /**
   * Получение номера блока последнего обновления
   */
  getBlockNum(): number | undefined {
    return this.block_num;
  }

  /**
   * Получение ключа для поиска сущности в блокчейне (статический метод)
   */
  public static getPrimaryKey(): string {
    return ProjectWalletDomainEntity.primary_key;
  }

  /**
   * Получение ключа для синхронизации сущности в блокчейне и базе данных (статический метод)
   */
  public static getSyncKey(): string {
    return ProjectWalletDomainEntity.sync_key;
  }

  /**
   * Получение ключа для поиска сущности в блокчейне
   */
  getPrimaryKey(): string {
    return ProjectWalletDomainEntity.primary_key;
  }

  /**
   * Получение ключа для синхронизации сущности в блокчейне и базе данных
   */
  getSyncKey(): string {
    return ProjectWalletDomainEntity.sync_key;
  }

  /**
   * Обновление данных из блокчейна
   * Обновляет текущий экземпляр
   */
  updateFromBlockchain(blockchainData: IProjectWalletBlockchainData, blockNum: number, present = true): void {
    // Обновляем базовые поля через метод базового класса
    this.block_num = blockNum;
    this.present = present;

    // Обновляем специфичные поля из блокчейна
    Object.assign(this, blockchainData);

    // Нормализация hash полей
    if (this.project_hash) this.project_hash = this.project_hash.toLowerCase();
  }
}
