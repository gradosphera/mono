/**
 * Общие типы пресетов Matrix-комнат ChatCoop (комната пайщиков, комната проекта Capital и т.д.).
 */

/** Элемент initial_state при создании комнаты (Matrix Client-Server API) */
export type MatrixRoomInitialStateEvent = {
  type: string;
  state_key: string;
  content: Record<string, unknown>;
};

/** Параметры createRoom + билдер power_level_content_override */
export type MatrixChatRoomPreset = {
  /** Метка для логов и документации */
  label: string;
  isPrivate: boolean;
  encrypt: boolean;
  roomType: string | undefined;
  initialState: MatrixRoomInitialStateEvent[];
  buildPowerLevels: (adminUserId: string) => Record<string, unknown>;
};
