// domain/provider/RegisterProviderInteractor.ts

import { Injectable } from '@nestjs/common';
import { ProviderService } from './provider.service';

@Injectable()
export class ProviderInteractor {
  constructor(private readonly providerService: ProviderService) {}

  registerProvider(name: string, providerInstance: any) {
    this.providerService.registerProvider(name, providerInstance);
  }

  getProvider(name: string) {
    return this.providerService.getProvider(name);
  }
}
