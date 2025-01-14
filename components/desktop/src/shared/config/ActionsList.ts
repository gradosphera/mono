/**
 * Список контрактов хранения бизнес-логики и таблиц в блокчейне
 */
export enum MarketplaceActionsList {
  /** Принять заявку в маркетплейсе */
  Accept = 'accept',
  Decline = 'decline',
  Cancel = 'cancel',
  Supply = 'supply',
  ConfirmSupply = 'supplycnfrm',
  Delivered = 'delivered',
  Recieve = 'recieve',
  ConfirmRecieve = 'recievecnfrm',
  Complete = 'complete',
  Dispute = 'dispute',
  Offer = 'offer',
  Order = 'order',
  Publish = 'publish',
  Unpublish = 'unpublish',
  Moderate = 'moderate',
  Prohibit = 'prohibit',
  Update = 'update',
}
