import crypto from 'crypto';

/**
 * Преобразует Matrix room ID в LiveKit room name согласно алгоритму Element Call
 *
 * Алгоритм:
 * 1. Берется Matrix room ID (например: "!room:server.com")
 * 2. Добавляется суффикс "|m.call#ROOM"
 * 3. Вычисляется SHA256 хэш в бинарном формате
 * 4. Кодируется в base64
 * 5. Удаляются знаки равенства
 *
 * @param matrixRoomId Matrix room ID (например: "!room:server.com")
 * @returns LiveKit room name (например: "vl/abc123...")
 */
export function matrixRoomIdToLivekitRoomName(matrixRoomId: string): string {
  // Шаг 1: Добавляем суффикс
  const input = `${matrixRoomId}|m.call#ROOM`;
  // Шаг 2: Вычисляем SHA256 хэш в бинарном формате
  const hashBuffer = crypto.createHash('sha256').update(input, 'utf8').digest();

  // Шаг 3: Кодируем в base64
  const base64Hash = hashBuffer.toString('base64');

  // Шаг 4: Удаляем знаки равенства
  const cleanBase64 = base64Hash.replace(/=+$/, '');

  // Шаг 5:
  const result = `${cleanBase64}`;
  return result;
}

/**
 * Находит соответствующий Matrix room ID для данного LiveKit room name
 *
 * @param livekitRoomName LiveKit room name (например: "vl/abc123...")
 * @param possibleMatrixRoomIds Массив возможных Matrix room IDs для проверки
 * @returns Matrix room ID если найден, иначе null
 */
export function findMatrixRoomIdForLivekitRoom(
  livekitRoomName: string,
  possibleMatrixRoomIds: string[]
): string | null {
  for (const matrixRoomId of possibleMatrixRoomIds) {
    const computedLivekitName = matrixRoomIdToLivekitRoomName(matrixRoomId);
    if (computedLivekitName === livekitRoomName) {
      return matrixRoomId;
    }
  }
  return null;
}

/**
 * Проверяет, соответствует ли LiveKit room name одному из Matrix room IDs кооператива
 *
 * @param livekitRoomName LiveKit room name из webhook
 * @param membersRoomId Matrix room ID комнаты пайщиков
 * @param councilRoomId Matrix room ID комнаты совета
 * @returns Объект с информацией о соответствии
 */
export function matchLivekitRoomToMatrixRooms(
  livekitRoomName: string,
  membersRoomId: string,
  councilRoomId: string
): {
  isMatch: boolean;
  matrixRoomId: string | null;
  roomType: 'members' | 'council' | null;
  displayName: string | null;
} {
  const possibleRooms = [
    { id: membersRoomId, type: 'members' as const, displayName: 'Комната пайщиков' },
    { id: councilRoomId, type: 'council' as const, displayName: 'Комната совета' }
  ];

  for (const room of possibleRooms) {
    const computedName = matrixRoomIdToLivekitRoomName(room.id);
    if (computedName === livekitRoomName) {
      return {
        isMatch: true,
        matrixRoomId: room.id,
        roomType: room.type,
        displayName: room.displayName
      };
    }
  }

  return {
    isMatch: false,
    matrixRoomId: null,
    roomType: null,
    displayName: null
  };
}
