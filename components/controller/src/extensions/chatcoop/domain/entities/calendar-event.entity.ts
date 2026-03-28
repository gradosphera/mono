/** Доменная сущность события календаря ChatCoop (кооперативный календарь в незашифрованных Matrix-комнатах). */
export interface ChatCoopCalendarEventDomainEntity {
  id: string;
  matrixRoomId: string;
  title: string;
  description: string | null;
  startsAt: Date;
  endsAt: Date | null;
  createdByUsername: string;
  /** Для поля SEQUENCE в ICS при обновлениях */
  icsSequence: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateChatCoopCalendarEventDomainInput {
  matrixRoomId: string;
  title: string;
  description: string | null;
  startsAt: Date;
  endsAt: Date | null;
  createdByUsername: string;
}

export interface UpdateChatCoopCalendarEventDomainInput {
  id: string;
  matrixRoomId: string;
  title: string;
  description: string | null;
  startsAt: Date;
  endsAt: Date | null;
}
