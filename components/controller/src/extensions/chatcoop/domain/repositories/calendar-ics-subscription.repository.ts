/** Подписка ICS: один секрет на пользователя кооператива (username пайщика). */
export interface ChatCoopCalendarIcsSubscriptionDomainEntity {
  id: string;
  coopUsername: string;
  secretSha256Hex: string;
  createdAt: Date;
}

export interface ChatCoopCalendarIcsSubscriptionRepository {
  create(coopUsername: string, secretSha256Hex: string): Promise<ChatCoopCalendarIcsSubscriptionDomainEntity>;
  findById(id: string): Promise<ChatCoopCalendarIcsSubscriptionDomainEntity | null>;
  /** Заменить секрет существующей подписки пользователя (ротация URL). */
  rotateSecretForUser(coopUsername: string, secretSha256Hex: string): Promise<ChatCoopCalendarIcsSubscriptionDomainEntity>;
  findByUsername(coopUsername: string): Promise<ChatCoopCalendarIcsSubscriptionDomainEntity | null>;
}

export const CHATCOOP_CALENDAR_ICS_SUBSCRIPTION_REPOSITORY = Symbol('ChatCoopCalendarIcsSubscriptionRepository');
