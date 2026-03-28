import { Injectable } from '@nestjs/common';
import type { InterChatCoopCalendarPort, InterCalendarEventWindow } from '@coopenomics/inter';
import { ChatCoopCalendarApplicationService } from '../../application/services/chatcoop-calendar-application.service';

@Injectable()
export class ChatcoopInterChatCoopCalendarAdapter implements InterChatCoopCalendarPort {
  constructor(private readonly calendar: ChatCoopCalendarApplicationService) {}

  async listEventsByProjectHash(input: {
    projectHash: string;
    window?: InterCalendarEventWindow;
  }) {
    return this.calendar.listEventsForInterPort(input.projectHash, input.window);
  }
}
