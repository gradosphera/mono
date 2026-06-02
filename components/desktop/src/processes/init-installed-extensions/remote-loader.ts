// Epic 9 story 9.4 — remote-loader для apps-catalog.
//
// На boot'е desktop'а, после регистрации bundle-extensions, идём в coopback
// за списком пакетов с активной подпиской у текущего кооператива и пробуем
// dynamic-eval'ом распаковать install.js из каждого tarball'а, чтобы получить
// `IWorkspaceConfig[]` и добавить роуты в router.
//
// V1 МИНИМУМ (заглушка):
//   - Логирует попытку, не падает, не сетевые запросы.
//   - Возвращает пустой массив, чтобы `init-installed-extensions/index.ts`
//     просто пропустил remote-pass.
//
// V2 (story 9.4.b) — настоящий fetch + eval. Контракт coopback'а:
//   GET  /api/catalog/installed-remote?coopname=<X>
//   →  { items: [{ packageId, version, tarballUrl, sha256, jwt }] }
//   Контракт ca-auth (pull-surface):
//   GET  /v1/pull/<packageId>/<version>?token=<jwt>
//   →  application/gzip tar (распакованный install.js + package.json)
//
// Изоляция: V1 НЕ выполняет код пакетов (это будет sandbox в story 11.x).

import type { Router } from 'vue-router';
import type { IWorkspaceConfig } from 'src/shared/lib/types/workspace';

export interface RemoteExtensionDescriptor {
  packageId: string;       // например `@voskhod/demoapp`
  version: string;         // semver
  tarballUrl: string;      // ca-auth pull URL
  sha256: string;          // ожидаемый sha256 распакованного install.js
  jwt: string;             // tenant-token для pull-запроса
}

/**
 * Запросить у coopback список remote-пакетов, на которые у текущего
 * кооператива есть активная подписка. На V1 — заглушка.
 */
export async function fetchInstalledRemotePackages(
  _coopname: string,
): Promise<RemoteExtensionDescriptor[]> {
  // TODO (story 9.4.b): реальный fetch к coopback'у.
  // const res = await api.get<{ items: RemoteExtensionDescriptor[] }>(
  //   `/api/catalog/installed-remote?coopname=${encodeURIComponent(coopname)}`,
  // );
  // return res.items;
  return [];
}

/**
 * Скачать tarball, распаковать, eval'ом получить IWorkspaceConfig[].
 * На V1 — заглушка, возвращает пустой массив.
 */
export async function loadRemoteExtension(
  desc: RemoteExtensionDescriptor,
): Promise<IWorkspaceConfig[]> {
  // TODO (story 9.4.b): fetch + tar-x + dynamic require + sha256-check.
  console.warn(
    `[remote-loader] story 9.4.b TODO: установка ${desc.packageId}@${desc.version} ` +
      `пропущена в V1 пилоте (см. docs/epics/E9-demo-app-pilot.md).`,
  );
  return [];
}

/**
 * Один pass remote-loader'а: получить список → загрузить каждый → отдать
 * слитый массив workspace'ов вызывателю, который сам впишет их в store/router.
 *
 * Падение одного пакета не должно валить остальные (try/catch per item).
 */
export async function installRemoteExtensions(
  coopname: string,
  _router: Router,
): Promise<IWorkspaceConfig[]> {
  const descriptors = await fetchInstalledRemotePackages(coopname);
  const all: IWorkspaceConfig[] = [];
  for (const desc of descriptors) {
    try {
      const cfgs = await loadRemoteExtension(desc);
      all.push(...cfgs);
    } catch (err) {
      console.error(
        `[remote-loader] не удалось установить ${desc.packageId}@${desc.version}:`,
        err,
      );
    }
  }
  return all;
}
