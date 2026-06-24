import { env } from 'src/shared/config';

/** Как MIN_SOVIET_MEMBERS_COUNT в контракте soviet: 1 на dev/testnet, 3 на production. */
export function getMinSovietMembersCount(): number {
  return env.NODE_ENV === 'production' ? 3 : 1;
}
