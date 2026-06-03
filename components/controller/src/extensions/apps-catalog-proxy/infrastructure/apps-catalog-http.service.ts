import { Injectable, Logger } from '@nestjs/common';
import axios, { type AxiosInstance } from 'axios';
import config from '~/config/config';

interface PublicPackageWireFormat {
  package_id: string;
  owner_username: string;
  compatible_subnets: string[];
  last_active_version: string | null;
}

export interface AppsCatalogPackage {
  packageId: string;
  publisher: string;
  compatibleSubnets: string[];
  lastActiveVersion: string | null;
}

/**
 * HTTP-клиент к ca-admin (apps-catalog) для Story 9.5.b. Защищён admin-API
 * ключом из env (APPS_CATALOG_API_KEY). Используется только сервером —
 * ключ в браузер не утекает.
 *
 * Degraded mode: если APPS_CATALOG_URL / APPS_CATALOG_API_KEY не заданы —
 * возвращает пустой список вместо ошибки, чтобы dev-окружение без
 * apps-catalog (или CI без сети) не валило desktop boot.
 */
@Injectable()
export class AppsCatalogHttpService {
  private readonly logger = new Logger(AppsCatalogHttpService.name);
  private readonly client: AxiosInstance | null;

  constructor() {
    if (config.apps_catalog.url && config.apps_catalog.api_key) {
      this.client = axios.create({
        baseURL: config.apps_catalog.url,
        timeout: 5000,
        headers: {
          Authorization: `Bearer ${config.apps_catalog.api_key}`,
        },
      });
    } else {
      this.client = null;
      this.logger.warn(
        'APPS_CATALOG_URL/APPS_CATALOG_API_KEY не заданы — apps-catalog-proxy в degraded mode (пустой каталог)',
      );
    }
  }

  async listPublicPackages(page = 1, pageSize = 50): Promise<AppsCatalogPackage[]> {
    if (!this.client) return [];
    try {
      const res = await this.client.get<PublicPackageWireFormat[]>(
        '/v1/public/packages',
        { params: { page, page_size: pageSize } },
      );
      return res.data.map((p) => ({
        packageId: p.package_id,
        publisher: p.owner_username,
        compatibleSubnets: p.compatible_subnets,
        lastActiveVersion: p.last_active_version,
      }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(`apps-catalog list failed: ${msg}`);
      return [];
    }
  }

  /**
   * Story 9.4.b: получить install.js пакета remote-расширения.
   *
   * Возвращает plain CJS-текст из ca-admin endpoint'а
   * `GET /v1/public/packages/:scope/:name/install.js`. На degraded mode
   * (без env-config'а apps-catalog'а) либо если ca-admin отвечает 404
   * — возвращает `null`, чтобы desktop'у было ясно «нет такого пакета /
   * каталог недоступен» вместо ошибки 500 в браузере.
   *
   * @param scope владелец пакета (`voskhod` из `@voskhod/demo-app`).
   * @param name  short-name пакета (`demo-app`).
   */
  async fetchInstallScript(scope: string, name: string): Promise<string | null> {
    if (!this.client) return null;
    try {
      const res = await this.client.get<string>(
        `/v1/public/packages/${encodeURIComponent(scope)}/${encodeURIComponent(name)}/install.js`,
        { responseType: 'text', transformResponse: (data) => data as string },
      );
      return typeof res.data === 'string' ? res.data : String(res.data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(
        `apps-catalog install.js fetch failed for ${scope}/${name}: ${msg}`,
      );
      return null;
    }
  }
}
