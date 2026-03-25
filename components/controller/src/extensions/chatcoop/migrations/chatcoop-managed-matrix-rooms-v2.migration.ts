// Миграция схемы chatcoop v2: заполнение реестра Matrix-комнат (members/council из конфига, проекты из capital_projects).

import { DataSource } from 'typeorm';
import type {
  IExtensionSchemaMigration,
  ExtensionSchemaMigrationAfterContext,
} from '~/domain/extension/services/extension-schema-migration.service';
import {
  EXTENSION_REPOSITORY,
  type ExtensionDomainRepository,
} from '~/domain/extension/repositories/extension-domain.repository';
import {
  CHATCOOP_MANAGED_MATRIX_ROOM_REPOSITORY,
  type ChatcoopManagedMatrixRoomRepository,
} from '../domain/repositories/managed-matrix-room.repository';

interface ChatCoopConfigRoomsSlice {
  membersRoomId?: string;
  councilRoomId?: string;
}

async function backfillManagedRooms(
  ctx: ExtensionSchemaMigrationAfterContext,
  managedRooms: ChatcoopManagedMatrixRoomRepository,
  cfg: ChatCoopConfigRoomsSlice | undefined
): Promise<void> {
  const { logInfo, logWarn } = ctx;
  const membersId = cfg?.membersRoomId?.trim();
  if (membersId) {
    await managedRooms.upsertRoom({
      matrixRoomId: membersId,
      encrypted: true,
      kind: 'members',
      displayLabel: 'Комната пайщиков',
      projectHash: null,
    });
    logInfo('[chatcoop schema v2] Реестр: комната пайщиков');
  }
  const councilId = cfg?.councilRoomId?.trim();
  if (councilId) {
    await managedRooms.upsertRoom({
      matrixRoomId: councilId,
      encrypted: true,
      kind: 'council',
      displayLabel: 'Комната совета',
      projectHash: null,
    });
    logInfo('[chatcoop schema v2] Реестр: комната совета');
  }

  let projectRows: { project_hash: string; title: string; matrix_room_id: string }[] = [];
  try {
    const ds = ctx.resolve<DataSource>(DataSource);
    projectRows = (await ds.query(
      `SELECT project_hash, title, matrix_room_id FROM capital_projects WHERE matrix_room_id IS NOT NULL AND matrix_room_id <> ''`
    )) as { project_hash: string; title: string; matrix_room_id: string }[];
  } catch (e) {
    logWarn(`[chatcoop schema v2] Таблица capital_projects недоступна: ${String(e)}`);
  }

  for (const pr of projectRows) {
    const label = (pr.title || pr.project_hash).slice(0, 500);
    await managedRooms.upsertRoom({
      matrixRoomId: pr.matrix_room_id,
      encrypted: false,
      kind: 'capital_project',
      displayLabel: label,
      projectHash: pr.project_hash,
    });
  }
  logInfo(`[chatcoop schema v2] Реестр: комнаты проектов Capital — ${projectRows.length} записей`);
}

/**
 * v2: перенос идентификаторов комнат из конфига и БД Capital в таблицу chatcoop_managed_matrix_rooms.
 * Конфиг JSON не меняется; повышается только schema_version расширения.
 */
export const chatcoopManagedMatrixRoomsV2Migration: IExtensionSchemaMigration<
  Record<string, unknown>,
  Record<string, unknown>
> = {
  extensionName: 'chatcoop',
  version: 2,

  migrate(oldConfig, defaultConfig) {
    return { ...defaultConfig, ...oldConfig };
  },

  async afterMigrate(ctx: ExtensionSchemaMigrationAfterContext): Promise<void> {
    const managedRooms = ctx.resolve<ChatcoopManagedMatrixRoomRepository>(CHATCOOP_MANAGED_MATRIX_ROOM_REPOSITORY);
    const extensionRepo = ctx.resolve<ExtensionDomainRepository<ChatCoopConfigRoomsSlice>>(EXTENSION_REPOSITORY);
    const ext = await extensionRepo.findByName('chatcoop');
    await backfillManagedRooms(ctx, managedRooms, ext?.config);
  },
};
