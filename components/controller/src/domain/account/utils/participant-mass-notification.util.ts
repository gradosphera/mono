import type { AccountDomainEntity } from '~/domain/account/entities/account-domain.entity';
import { MonoAccountStatusDomainInterface } from '~/domain/account/interfaces/mono-account-domain.interface';

/**
 * Кого включать в массовые уведомления «для пайщиков» (собрания, календарь и т.д.).
 * Исключаем незавершённую регистрацию и проблемные статусы.
 */
export function isEligibleForParticipantMassNotification(account: AccountDomainEntity): boolean {
  const p = account.provider_account;
  if (!p) {
    return false;
  }
  if (!p.is_registered || !p.has_account) {
    return false;
  }

  const status = p.status;
  if (
    status === MonoAccountStatusDomainInterface.Failed ||
    status === MonoAccountStatusDomainInterface.Refunded ||
    status === MonoAccountStatusDomainInterface.Blocked
  ) {
    return false;
  }

  return (
    status === MonoAccountStatusDomainInterface.Active || status === MonoAccountStatusDomainInterface.Registered
  );
}
