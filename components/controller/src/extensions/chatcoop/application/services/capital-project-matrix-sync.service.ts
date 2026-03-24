import { Injectable, Inject, Logger } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { MatrixApiService } from './matrix-api.service';
import { CAPITAL_PROJECT_ROOM_MATRIX } from '../config/matrix-capital-project-room.config';
import { MatrixUserManagementService } from '../../domain/services/matrix-user-management.service';
import { ChatCoopApplicationService } from './chatcoop-application.service';
import {
  EXTENSION_REPOSITORY,
  type ExtensionDomainRepository,
} from '~/domain/extension/repositories/extension-domain.repository';
import { USER_REPOSITORY, type UserRepository } from '~/domain/user/repositories/user.repository';
import type { IConfig } from '../../chatcoop-extension.module';
import {
  CAPITAL_PROJECT_CREATED_EVENT,
  CAPITAL_PROJECT_MATRIX_ROOM_ASSIGNED_EVENT,
  type ICapitalProjectCreatedPayload,
  type ICapitalProjectMatrixRoomAssignedPayload,
} from '~/shared/constants/capital-project-matrix.events';

/**
 * Создаёт Matrix-комнату для проекта Capital и уведомляет Capital через событие (без импорта CapitalPluginModule).
 */
@Injectable()
export class CapitalProjectMatrixSyncService {
  private readonly logger = new Logger(CapitalProjectMatrixSyncService.name);

  constructor(
    private readonly matrixApiService: MatrixApiService,
    private readonly matrixUserManagementService: MatrixUserManagementService,
    private readonly chatCoopApplicationService: ChatCoopApplicationService,
    private readonly eventEmitter: EventEmitter2,
    @Inject(EXTENSION_REPOSITORY) private readonly extensionRepository: ExtensionDomainRepository<IConfig>,
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository
  ) {}

  @OnEvent(CAPITAL_PROJECT_CREATED_EVENT)
  async handleProjectCreated(payload: ICapitalProjectCreatedPayload): Promise<void> {
    try {
      const chatcoop = await this.extensionRepository.findByName('chatcoop');
      const cfg = chatcoop?.config;
      if (!cfg?.isInitialized || !cfg.spaceId) {
        this.logger.debug('ChatCoop не инициализирован или нет spaceId — пропуск создания комнаты проекта');
        return;
      }

      const roomName = payload.title.slice(0, 240);
      const adminUserId = this.matrixApiService.getAdminUserId();
      const projectMatrix = CAPITAL_PROJECT_ROOM_MATRIX;
      const powerLevels = projectMatrix.buildPowerLevels(adminUserId);

      const roomId = await this.matrixApiService.createRoom(
        roomName,
        `Проект ${payload.project_hash}`,
        projectMatrix.isPrivate,
        projectMatrix.roomType,
        projectMatrix.initialState.length > 0 ? projectMatrix.initialState : undefined,
        projectMatrix.encrypt,
        powerLevels as Record<string, unknown>
      );

      await this.matrixApiService.addRoomToSpace(cfg.spaceId, roomId);

      const councilUsers = await this.userRepository.findByRoles(['chairman', 'member']);
      const seenUsernames = new Set<string>();
      for (const u of councilUsers) {
        if (seenUsernames.has(u.username)) {
          continue;
        }
        seenUsernames.add(u.username);
        const matrixUser = await this.matrixUserManagementService.getMatrixUserByCoopUsername(u.username);
        if (!matrixUser) {
          continue;
        }
        try {
          await this.matrixApiService.joinRoom(matrixUser.matrixUserId, roomId);
          await this.chatCoopApplicationService.applyMembersRoomStylePowerForUser(
            matrixUser.matrixUserId,
            roomId,
            u.role
          );
        } catch (err) {
          this.logger.warn(`Не удалось добавить ${u.username} в комнату проекта ${payload.project_hash}: ${String(err)}`);
        }
      }

      const assigned: ICapitalProjectMatrixRoomAssignedPayload = {
        project_hash: payload.project_hash,
        matrix_room_id: roomId,
      };
      this.eventEmitter.emit(CAPITAL_PROJECT_MATRIX_ROOM_ASSIGNED_EVENT, assigned);
    } catch (error) {
      this.logger.error(
        `Ошибка Matrix для проекта ${payload.project_hash}: ${String(error)}`,
        error instanceof Error ? error.stack : undefined
      );
    }
  }
}
