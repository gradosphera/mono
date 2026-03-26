import type {
  ChatcoopManagedMatrixRoomKind,
  ManagedMatrixRoomDomainEntity,
} from '../entities/managed-matrix-room.entity';

/** Вход для upsert без служебных полей БД */
export interface UpsertManagedMatrixRoomInput {
  matrixRoomId: string;
  encrypted: boolean;
  kind: ChatcoopManagedMatrixRoomKind;
  displayLabel: string;
  projectHash: string | null;
}

/**
 * Реестр Matrix-комнат ChatCoop: пайщики, совет, проекты Capital.
 * Секретарь обрабатывает только комнаты с encrypted === false.
 */
export interface ChatcoopManagedMatrixRoomRepository {
  upsertRoom(input: UpsertManagedMatrixRoomInput): Promise<ManagedMatrixRoomDomainEntity>;
  findByMatrixRoomId(matrixRoomId: string): Promise<ManagedMatrixRoomDomainEntity | null>;
  findByKind(kind: ChatcoopManagedMatrixRoomKind): Promise<ManagedMatrixRoomDomainEntity[]>;
  /** Комнаты проекта Capital (kind capital_project, projectHash задан). */
  findByProjectHash(projectHash: string): Promise<ManagedMatrixRoomDomainEntity[]>;
  /** Комнаты, в которых секретарь может участвовать в звонке и писать plaintext в Matrix */
  findEligibleForSecretaryTranscription(): Promise<ManagedMatrixRoomDomainEntity[]>;
}

export const CHATCOOP_MANAGED_MATRIX_ROOM_REPOSITORY = Symbol('ChatcoopManagedMatrixRoomRepository');
