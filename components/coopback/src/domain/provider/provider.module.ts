// domain/provider/provider.module.ts

import { Module, Global } from '@nestjs/common';
import { ProviderService } from './provider.service';
import { ProviderInteractor } from './provider.interactor';

@Global()
@Module({
  providers: [ProviderService, ProviderInteractor],
  exports: [ProviderInteractor], // Экспортируем для использования в других модулях
})
export class ProviderModule {}
