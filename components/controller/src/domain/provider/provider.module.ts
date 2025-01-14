// domain/provider/provider.module.ts

import { Module, Global } from '@nestjs/common';
import { ProviderDomainService } from './provider-domain.service';
import { ProviderInteractor } from './provider.interactor';

@Global()
@Module({
  providers: [ProviderDomainService, ProviderInteractor],
  exports: [ProviderInteractor, ProviderDomainService], // Экспортируем для использования в других модулях
})
export class ProviderDomainModule {}
