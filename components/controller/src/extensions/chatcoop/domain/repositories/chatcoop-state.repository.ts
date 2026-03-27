import type { ChatcoopStateDomainEntity } from '../entities/chatcoop-state.entity';

export const CHATCOOP_STATE_REPOSITORY = Symbol('CHATCOOP_STATE_REPOSITORY');

export { CHATCOOP_STATE_SINGLETON_ID } from '../chatcoop-state.constants';

export interface ChatcoopStateMergeInput {
  spaceId?: string | null;
  isInitialized?: boolean;
  secretaryMatrixUserId?: string | null;
  secretaryInitialized?: boolean;
  secretaryUsername?: string | null;
  secretaryPasswordEncrypted?: string | null;
}

export interface ChatcoopStateRepository {
  getSingleton(): Promise<ChatcoopStateDomainEntity>;
  merge(input: ChatcoopStateMergeInput): Promise<ChatcoopStateDomainEntity>;
}
