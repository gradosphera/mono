// Доменная сущность сегмента транскрипции
// Представляет распознанный фрагмент речи одного участника

export interface TranscriptionSegmentDomainEntity {
  id: string;
  transcriptionId: string; // FK -> CallTranscription
  speakerIdentity: string; // LiveKit participant identity
  speakerName: string; // Отображаемое имя говорящего
  text: string; // Распознанный текст
  startOffset: number; // Секунды от начала звонка
  endOffset: number; // Секунды от начала звонка
  createdAt: Date;
}
