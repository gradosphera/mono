import { Controller, Get, Query, Res, Logger } from '@nestjs/common';
import type { Response } from 'express';
import { ChatCoopCalendarApplicationService } from '../services/chatcoop-calendar-application.service';

/**
 * Публичная лента ICS по секрету в query (без JWT). Google Calendar и др. клиенты опрашивают URL напрямую.
 */
@Controller('v1/extensions/chatcoop/calendar')
export class ChatCoopCalendarFeedController {
  private readonly logger = new Logger(ChatCoopCalendarFeedController.name);

  constructor(private readonly calendar: ChatCoopCalendarApplicationService) {}

  @Get('feed.ics')
  async feed(
    @Query('id') subscriptionId: string,
    @Query('secret') secret: string,
    @Res() res: Response
  ): Promise<void> {
    if (typeof subscriptionId !== 'string' || subscriptionId.length === 0) {
      res.status(400).send('Missing id');
      return;
    }
    if (typeof secret !== 'string' || secret.length === 0) {
      res.status(400).send('Missing secret');
      return;
    }
    try {
      const body = await this.calendar.buildIcsDocumentForSubscription(subscriptionId, secret);
      if (!body) {
        res.status(404).send('Not found');
        return;
      }
      res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
      res.setHeader('Cache-Control', 'private, max-age=300');
      res.status(200).send(body);
    } catch (e) {
      this.logger.warn(`ICS feed error: ${String(e)}`);
      res.status(500).send('Internal error');
    }
  }
}
