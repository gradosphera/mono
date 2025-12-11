import { Injectable, Logger } from '@nestjs/common';
import config from '~/config/config';
import { VarsRepository, VARS_REPOSITORY } from '~/domain/common/repositories/vars.repository';
import { Inject } from '@nestjs/common';
import { MatrixApiService } from '../../application/services/matrix-api.service';
import { UNION_CHAT_REPOSITORY, UnionChatRepository } from '../repositories/union-chat.repository';
import { AccountDomainEntity } from '~/domain/account/entities/account-domain.entity';
import {
  ExtensionDomainRepository,
  EXTENSION_REPOSITORY,
} from '~/domain/extension/repositories/extension-domain.repository';
import { IConfig } from '../../chatcoop-extension.module';
import { OrganizationType } from '~/application/account/enum/organization-type.enum';

@Injectable()
export class UnionChatService {
  private readonly logger = new Logger(UnionChatService.name);

  constructor(
    private readonly matrixApiService: MatrixApiService,
    @Inject(VARS_REPOSITORY) private readonly varsRepository: VarsRepository,
    @Inject(UNION_CHAT_REPOSITORY) private readonly unionChatRepository: UnionChatRepository,
    @Inject(EXTENSION_REPOSITORY) private readonly extensionRepository: ExtensionDomainRepository<IConfig>
  ) {}

  /**
   * Создает комнату связи кооператив ↔ союз и сохраняет запись.
   * Идемпотентность: проверяем по coopUsername.
   */
  async ensureUnionChat(account: AccountDomainEntity, matrixUserId: string): Promise<void> {
    try {
      if (!config.union?.is_unioned) {
        return;
      }

      const unionPersonId = config.union.union_person_id;
      const unionName = config.union.union_name || 'СПО РУСЬ';

      if (!unionPersonId) {
        this.logger.warn('union_person_id не задан, пропускаем создание комнаты союза');
        return;
      }

      // Только кооперативы (организационный аккаунт типа COOP). Для расширения на prodcoop добавить в список.
      const orgData = account.private_account?.organization_data;
      const allowedOrgTypes = new Set<string>([OrganizationType.COOP]);
      if (!orgData || !allowedOrgTypes.has(orgData.type)) {
        return;
      }

      const coopUsername = account.username;

      // Идемпотентность
      const existing = await this.unionChatRepository.findByCoopUsername(coopUsername);
      if (existing) {
        this.logger.debug(`Комната союза уже существует для ${coopUsername}, roomId=${existing.roomId}`);
        return;
      }

      const vars = await this.varsRepository.get();
      if (!vars) {
        this.logger.warn('vars не получены, пропускаем создание комнаты союза');
        return;
      }

      // Имя комнаты
      const roomName = `${vars.short_abbr} ${vars.name} & ${unionName}`;
      const topic = `Связь с представителем ${unionName}`;

      // Создаем комнату без шифрования, приватную
      const roomId = await this.matrixApiService.createRoom(roomName, topic, true, undefined, undefined, false);

      // Добавляем в пространство кооператива, если инициализировано
      const chatcoopConfig = await this.extensionRepository.findByName('chatcoop');
      if (chatcoopConfig?.config?.spaceId) {
        await this.matrixApiService.addRoomToSpace(chatcoopConfig.config.spaceId, roomId);
      }

      // Подключаем участников
      const adminUserId = this.matrixApiService.getAdminUserId();
      await this.matrixApiService.joinRoom(adminUserId, roomId);
      await this.matrixApiService.joinRoom(matrixUserId, roomId);
      await this.matrixApiService.joinRoom(unionPersonId, roomId);

      await this.unionChatRepository.create({
        coopUsername,
        matrixUserId,
        roomId,
        unionPersonId,
        unionName,
      });

      this.logger.log(`Создана комната союза ${roomId} для ${coopUsername}`);
    } catch (error) {
      this.logger.error(`Не удалось создать комнату союза для ${account.username}: ${error}`);
    }
  }
}
