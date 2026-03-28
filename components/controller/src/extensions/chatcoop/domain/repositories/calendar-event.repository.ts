import type {
  ChatCoopCalendarEventDomainEntity,
  CreateChatCoopCalendarEventDomainInput,
  UpdateChatCoopCalendarEventDomainInput,
} from '../entities/calendar-event.entity';

export interface ChatCoopCalendarEventRepository {
  create(input: CreateChatCoopCalendarEventDomainInput): Promise<ChatCoopCalendarEventDomainEntity>;
  update(input: UpdateChatCoopCalendarEventDomainInput): Promise<ChatCoopCalendarEventDomainEntity>;
  deleteById(id: string): Promise<void>;
  findById(id: string): Promise<ChatCoopCalendarEventDomainEntity | null>;
  listAll(): Promise<ChatCoopCalendarEventDomainEntity[]>;
  /** События в комнатах с заданным project_hash в реестре управляемых комнат */
  listByManagedRoomProjectHashes(
    projectHashes: string[],
    window?: { from: Date; to: Date }
  ): Promise<ChatCoopCalendarEventDomainEntity[]>;
}

export const CHATCOOP_CALENDAR_EVENT_REPOSITORY = Symbol('ChatCoopCalendarEventRepository');
