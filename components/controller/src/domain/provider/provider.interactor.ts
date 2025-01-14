// domain/provider/RegisterProviderInteractor.ts

import { Injectable } from '@nestjs/common';
import { ProviderDomainService } from './provider-domain.service';

@Injectable()
export class ProviderInteractor {
  constructor(private readonly providerService: ProviderDomainService) {}

  registerProvider(name: string, providerInstance: any) {
    this.providerService.registerProvider(name, providerInstance);
  }

  getProvider(name: string) {
    return this.providerService.getProvider(name);
  }
}
