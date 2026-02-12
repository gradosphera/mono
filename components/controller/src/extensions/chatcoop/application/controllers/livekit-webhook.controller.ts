import { Controller, Post, Req, Body, Logger, Inject } from '@nestjs/common';
import { SecretaryAgentService } from '../services/secretary-agent.service';
import {
  ExtensionDomainRepository,
  EXTENSION_REPOSITORY,
} from '~/domain/extension/repositories/extension-domain.repository';
import type { IConfig } from '../../chatcoop-extension.module';

/**
 * Интерфейс события webhook от LiveKit (пересланного через chatcoop-proxy)
 */
interface LiveKitWebhookEvent {
  event: string; // 'room_started' | 'room_finished' | 'participant_joined' | 'participant_left' | ...
  room?: {
    name: string; // LiveKit room name (= Matrix room ID)
    sid: string;
    emptyTimeout?: number;
    maxParticipants?: number;
    creationTime?: string;
    numParticipants?: number;
  };
  participant?: {
    identity: string;
    name: string;
    sid: string;
    state?: number;
  };
  id?: string;
  createdAt?: string;
}

/**
 * REST-контроллер для приема forwarded webhook от chatcoop-proxy
 *
 * Маршрут: POST /api/chatcoop/livekit-webhook
 *
 * chatcoop-proxy пересылает webhook события от LiveKit на все зарегистрированные
 * контроллеры кооперативов. Контроллер проверяет, относится ли событие к комнатам
 * данного кооператива, и если да — запускает/останавливает секретаря.
 */
@Controller('api/chatcoop')
export class LiveKitWebhookController {
  private readonly logger = new Logger(LiveKitWebhookController.name);

  constructor(
    private readonly secretaryAgentService: SecretaryAgentService,
    @Inject(EXTENSION_REPOSITORY) private readonly extensionRepository: ExtensionDomainRepository<IConfig>
  ) {}

  @Post('livekit-webhook')
  async handleWebhook(
    @Req() req: any,
    @Body() body: LiveKitWebhookEvent
  ): Promise<{ status: string }> {
    try {
      const event = body;
      this.logger.log(`Получен LiveKit webhook: event=${event.event}, room=${event.room?.name}`);

      // Получаем конфигурацию chatcoop
      const chatcoopConfig = await this.extensionRepository.findByName('chatcoop');
      if (!chatcoopConfig || !chatcoopConfig.config.isInitialized) {
        this.logger.warn('ChatCoop не инициализирован, игнорируем webhook');
        return { status: 'ignored' };
      }

      if (!chatcoopConfig.config.secretaryInitialized) {
        this.logger.warn('Секретарь не инициализирован, игнорируем webhook');
        return { status: 'ignored' };
      }

      const { membersRoomId, councilRoomId } = chatcoopConfig.config;
      const roomName = event.room?.name;

      if (!roomName) {
        this.logger.warn('Webhook без имени комнаты, игнорируем');
        return { status: 'ignored' };
      }

      // Проверяем, относится ли комната к этому кооперативу
      // LiveKit room name = Matrix room ID (так создает lk-jwt-service)
      const isOurRoom = roomName === membersRoomId || roomName === councilRoomId;

      if (!isOurRoom) {
        this.logger.log(`Комната ${roomName} не принадлежит этому кооперативу, игнорируем`);
        return { status: 'ignored' };
      }

      // Определяем человекочитаемое имя комнаты
      const roomDisplayName = roomName === membersRoomId ? 'Комната пайщиков' : 'Комната совета';

      switch (event.event) {
        case 'room_started':
          this.logger.log(`Комната ${roomName} (${roomDisplayName}) запущена, подключаем секретаря`);
          await this.secretaryAgentService.joinRoom(roomName, roomName, roomDisplayName);
          break;

        case 'room_finished':
          this.logger.log(`Комната ${roomName} (${roomDisplayName}) завершена, отключаем секретаря`);
          await this.secretaryAgentService.leaveRoom(roomName);
          break;

        case 'participant_joined':
          this.logger.log(
            `Участник ${event.participant?.identity} присоединился к ${roomDisplayName}`
          );
          break;

        case 'participant_left':
          this.logger.log(
            `Участник ${event.participant?.identity} покинул ${roomDisplayName}`
          );
          break;

        default:
          this.logger.log(`Необработанное событие LiveKit: ${event.event}`);
      }

      return { status: 'ok' };
    } catch (error) {
      this.logger.error(`Ошибка обработки LiveKit webhook: ${error}`);
      return { status: 'error' };
    }
  }
}
