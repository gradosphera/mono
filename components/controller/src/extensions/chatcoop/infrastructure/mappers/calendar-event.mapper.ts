import type { ChatCoopCalendarEventDomainEntity } from '../../domain/entities/calendar-event.entity';
import type { CalendarEventTypeormEntity } from '../entities/calendar-event.typeorm-entity';

export class CalendarEventMapper {
  static toDomain(row: CalendarEventTypeormEntity): ChatCoopCalendarEventDomainEntity {
    return {
      id: row.id,
      matrixRoomId: row.matrixRoomId,
      title: row.title,
      description: row.description,
      startsAt: row.startsAt,
      endsAt: row.endsAt,
      createdByUsername: row.createdByUsername,
      icsSequence: row.icsSequence,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
