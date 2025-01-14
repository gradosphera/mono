import {
  DraftContract,
  FundContract,
  GatewayContract,
  MarketContract,
  RegistratorContract,
  SovietContract,
  SystemContract,
  TokenContract,
} from 'cooptypes'

/**
 * Список контрактов хранения бизнес-логики и таблиц в блокчейне
 */
export const ContractsList = {
  /** Системный контракт */
  System: SystemContract.contractName.production,
  /** Контракт системного токена */
  Token: TokenContract.contractName.production,
  /** Контракт платежного шлюза */
  Gateway: GatewayContract.contractName.production,
  /** Контракт кооперативного маркетплейса */
  Marketplace: MarketContract.contractName.production,
  /** Контракт совета кооператива */
  Soviet: SovietContract.contractName.production,
  /** Контракт фондов кооператива */
  Fund: FundContract.contractName.production,
  /** Контракт шаблонов документов кооператива */
  Draft: DraftContract.contractName.production,
  /** Контракт регистратора аккаунтов кооператива */
  Registrator: RegistratorContract.contractName.production,
}
