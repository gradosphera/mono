import type { ProgramWalletDomainEntity } from "../entities/program-wallet-domain.entity";


/**
 * Фильтр для поиска программных кошельков
 */
export interface ProgramWalletFilterDomainInterface {
  coopname?: string;
  username?: string;
  program_id?: string;
}

/**
 * Порт для доступа к данным программных кошельков из домена wallet
 * Используется расширениями для получения данных кошельков без прямого доступа к интерактору приложения
 */
export interface WalletDomainPort {
  /**
   * Получить программный кошелек по фильтру
   * @param filter - критерии поиска
   * @returns Программный кошелек или null, если не найден
   */
  getProgramWallet(filter: ProgramWalletFilterDomainInterface): Promise<ProgramWalletDomainEntity | null>;

  /**
   * Получить список программных кошельков по фильтру
   * @param filter - критерии поиска
   * @returns Массив программных кошельков
   */
  getProgramWallets(filter: ProgramWalletFilterDomainInterface): Promise<ProgramWalletDomainEntity[]>;
}

export const WALLET_DOMAIN_PORT = Symbol('WALLET_DOMAIN_PORT');
