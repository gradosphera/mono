import { Injectable, Inject } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { WinstonLoggerService } from '~/application/logger/logger-app.service';
import {
  CAPITAL_PROJECT_MATRIX_ROOM_ASSIGNED_EVENT,
  type ICapitalProjectMatrixRoomAssignedPayload,
} from '~/shared/constants/capital-project-matrix.events';
import { PROJECT_REPOSITORY, type ProjectRepository } from '../../domain/repositories/project.repository';

/**
 * Сохраняет matrix_room_id проекта по событию из ChatCoop (без импорта модуля chatcoop).
 */
@Injectable()
export class CapitalProjectMatrixRoomAssignedListener {
  constructor(
    @Inject(PROJECT_REPOSITORY) private readonly projectRepository: ProjectRepository,
    private readonly logger: WinstonLoggerService
  ) {
    this.logger.setContext(CapitalProjectMatrixRoomAssignedListener.name);
  }

  @OnEvent(CAPITAL_PROJECT_MATRIX_ROOM_ASSIGNED_EVENT)
  async handleMatrixRoomAssigned(payload: ICapitalProjectMatrixRoomAssignedPayload): Promise<void> {
    try {
      await this.projectRepository.setMatrixRoomId(payload.project_hash, payload.matrix_room_id);
      this.logger.log(`matrix_room_id сохранён для проекта ${payload.project_hash}`);
    } catch (error) {
      this.logger.error(`Не удалось сохранить matrix_room_id для проекта ${payload.project_hash}: ${String(error)}`, error instanceof Error ? error.stack : undefined);
    }
  }
}
