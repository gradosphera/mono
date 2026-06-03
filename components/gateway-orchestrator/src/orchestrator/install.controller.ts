import { Body, Controller, Delete, Param, Post } from '@nestjs/common';
import { SubgraphRegistryService } from '../gateway/subgraph-registry.service';

export interface InstallExtensionInput {
  packageId: string;
  version: string;
  url: string;
}

/**
 * REST API для управления жизненным циклом расширений.
 *
 * **Story 10.3 (это PR):** только регистр — реальный docker compose pull/up
 * и healthcheck приедут в Story 10.4 (Install pipeline integration).
 * Сейчас endpoint просто пишет subgraph URL в registry; orchestrator-tests
 * могут руками поднять контейнер и POST'нуть сюда.
 *
 * **Story 10.4:** controller станет тонкой обёрткой, реальную работу
 * делает InstallOrchestratorService — pull image через CA-auth JWT,
 * docker compose up -d, healthcheck опрос, register.
 */
@Controller('v1/internal/extensions')
export class InstallController {
  constructor(private readonly registry: SubgraphRegistryService) {}

  @Post('install')
  async install(@Body() input: InstallExtensionInput) {
    if (!input.packageId || !input.version || !input.url) {
      return { ok: false, error: 'packageId, version, url обязательны' };
    }
    await this.registry.upsert(input.packageId, input.version, input.url);
    return { ok: true, registered: input.packageId, pollWithinMs: 10000 };
  }

  @Delete('uninstall/:packageId')
  async uninstall(@Param('packageId') packageId: string) {
    await this.registry.deactivate(packageId);
    return { ok: true, deactivated: packageId };
  }
}
