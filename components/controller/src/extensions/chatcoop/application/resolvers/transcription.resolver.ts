import { Resolver, Query, Args } from '@nestjs/graphql';
import { UseGuards, Logger } from '@nestjs/common';
import { GqlJwtAuthGuard } from '~/application/auth/guards/graphql-jwt-auth.guard';
import { RolesGuard } from '~/application/auth/guards/roles.guard';
import { AuthRoles } from '~/application/auth/decorators/auth.decorator';
import { CurrentUser } from '~/application/auth/decorators/current-user.decorator';
import type { MonoAccountDomainInterface } from '~/domain/account/interfaces/mono-account-domain.interface';
import { TranscriptionManagementService } from '../../domain/services/transcription-management.service';
import { MatrixUserManagementService } from '../../domain/services/matrix-user-management.service';
import {
  CallTranscriptionResponseDTO,
  CallTranscriptionWithSegmentsDTO,
  GetTranscriptionsInputDTO,
  GetTranscriptionInputDTO,
} from '../dto/transcription.dto';

/**
 * GraphQL resolver для транскрипций звонков
 *
 * Ролевой доступ:
 * - chairman / member (совет) — видят все транскрипции кооператива
 * - user (пайщик) — видит только транскрипции комнат, в которых участвовал
 */
@Resolver()
export class TranscriptionResolver {
  private readonly logger = new Logger(TranscriptionResolver.name);

  constructor(
    private readonly transcriptionService: TranscriptionManagementService,
    private readonly matrixUserService: MatrixUserManagementService
  ) {}

  /**
   * Получить список транскрипций
   * chairman/member видят все, user — только свои
   */
  @Query(() => [CallTranscriptionResponseDTO], {
    name: 'chatcoopGetTranscriptions',
    description: 'Получить список транскрипций звонков',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman', 'member', 'user'])
  async getTranscriptions(
    @CurrentUser() currentUser: MonoAccountDomainInterface,
    @Args('data', { type: () => GetTranscriptionsInputDTO, nullable: true })
    data?: GetTranscriptionsInputDTO
  ): Promise<CallTranscriptionResponseDTO[]> {
    const role = currentUser.role;
    const limit = data?.limit || 20;
    const offset = data?.offset || 0;

    this.logger.log(
      `Запрос транскрипций: user=${currentUser.username}, role=${role}, limit=${limit}, offset=${offset}`
    );

    // chairman и member видят все транскрипции
    if (role === 'chairman' || role === 'member') {
      if (data?.matrixRoomId) {
        return this.transcriptionService.getTranscriptionsByRoom(data.matrixRoomId);
      }
      return this.transcriptionService.getAllTranscriptions({ limit, offset });
    }

    // user видит только транскрипции, в которых участвовал
    // Получаем Matrix identity пользователя
    const matrixUser = await this.matrixUserService.getMatrixUserByCoopUsername(currentUser.username);
    if (!matrixUser) {
      this.logger.warn(`Matrix аккаунт не найден для ${currentUser.username}, возвращаем пустой список`);
      return [];
    }

    // Ищем транскрипции по идентификатору участника
    return this.transcriptionService.getTranscriptionsByParticipant(matrixUser.matrixUserId);
  }

  /**
   * Получить детальную транскрипцию с сегментами
   */
  @Query(() => CallTranscriptionWithSegmentsDTO, {
    name: 'chatcoopGetTranscription',
    description: 'Получить детальную транскрипцию с сегментами',
    nullable: true,
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman', 'member', 'user'])
  async getTranscription(
    @CurrentUser() currentUser: MonoAccountDomainInterface,
    @Args('data', { type: () => GetTranscriptionInputDTO }) data: GetTranscriptionInputDTO
  ): Promise<CallTranscriptionWithSegmentsDTO | null> {
    const role = currentUser.role;

    this.logger.log(`Запрос транскрипции ${data.id}: user=${currentUser.username}, role=${role}`);

    const result = await this.transcriptionService.getTranscriptionWithSegments(data.id);
    if (!result) {
      return null;
    }

    // Для user (обычного пайщика) проверяем, что он участвовал в звонке
    if (role !== 'chairman' && role !== 'member') {
      const matrixUser = await this.matrixUserService.getMatrixUserByCoopUsername(currentUser.username);
      if (!matrixUser) {
        this.logger.warn(`Matrix аккаунт не найден для ${currentUser.username}`);
        return null;
      }

      const isParticipant = result.transcription.participants.includes(matrixUser.matrixUserId);
      if (!isParticipant) {
        this.logger.warn(
          `Пользователь ${currentUser.username} не участвовал в звонке ${data.id}, доступ запрещён`
        );
        return null;
      }
    }

    return {
      transcription: result.transcription,
      segments: result.segments,
    };
  }
}
