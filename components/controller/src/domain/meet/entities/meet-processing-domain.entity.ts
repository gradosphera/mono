import type { MeetProcessingDomainInterface } from '../interfaces/meet-processing-domain.interface';
import type { MeetRowProcessingDomainInterface } from '../interfaces/meet-row-processing-domain.interface';
import type { QuestionRowProcessingDomainInterface } from '../interfaces/question-row-processing-domain.interface';
import { ExtendedMeetStatus } from '../enums/extended-meet-status.enum';

export class MeetProcessingDomainEntity implements MeetProcessingDomainInterface {
  public readonly hash!: string;
  public readonly meet!: MeetRowProcessingDomainInterface;
  public readonly questions!: QuestionRowProcessingDomainInterface[];
  public readonly isVoted: boolean = false;
  public readonly extendedStatus: ExtendedMeetStatus = ExtendedMeetStatus.NONE;

  constructor(data: MeetProcessingDomainInterface, username?: string) {
    Object.assign(this, data);

    // Если передан username, проверяем, голосовал ли пользователь
    if (username && this.questions) {
      this.isVoted = this.questions.some(
        (question) =>
          question.voters_for.includes(username) ||
          question.voters_against.includes(username) ||
          question.voters_abstained.includes(username)
      );
    }

    // Определяем расширенный статус собрания
    this.extendedStatus = this.calculateExtendedStatus();
  }

  /**
   * Вычисляет расширенный статус собрания на основе дат и состояния
   */
  private calculateExtendedStatus(): ExtendedMeetStatus {
    // Если нет данных о meet, возвращаем базовый статус
    if (!this.meet) {
      return ExtendedMeetStatus.NONE;
    }

    const { status, open_at, close_at, quorum_passed } = this.meet;
    const now = new Date();

    // Базовые статусы блокчейна
    if (status === 'created') {
      return ExtendedMeetStatus.CREATED;
    } else if (status === 'preclosed') {
      return ExtendedMeetStatus.PRECLOSED;
    } else if (status === 'closed') {
      return ExtendedMeetStatus.CLOSED;
    } else if (status === 'onrestart') {
      return ExtendedMeetStatus.ONRESTART;
    }

    // Расширенные статусы для 'authorized'
    if (status === 'authorized') {
      // Ожидание открытия
      if (now < open_at) {
        return ExtendedMeetStatus.WAITING_FOR_OPENING;
      }

      // Голосование идет
      if (close_at && now >= open_at && now <= close_at) {
        return ExtendedMeetStatus.VOTING_IN_PROGRESS;
      }

      // Голосование завершено
      if (close_at && now > close_at) {
        // Не достигнут кворум
        if (!quorum_passed) {
          return ExtendedMeetStatus.EXPIRED_NO_QUORUM;
        }

        // Кворум достигнут, ожидание подписей
        return ExtendedMeetStatus.VOTING_COMPLETED;
      }
    }

    // По умолчанию возвращаем статус из блокчейна
    return status as ExtendedMeetStatus;
  }
}
