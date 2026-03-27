/** Состояние ChatCoop в PG: переживает удаление/переустановку строки расширения в `extensions`. */
export interface ChatcoopStateDomainEntity {
  readonly id: string;
  spaceId: string | null;
  isInitialized: boolean;
  secretaryMatrixUserId: string | null;
  secretaryInitialized: boolean;
  secretaryUsername: string | null;
  secretaryPasswordEncrypted: string | null;
}
