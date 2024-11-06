// domain/provider/ProviderService.ts

import { Injectable } from '@nestjs/common';

@Injectable()
export class ProviderService {
  private providers: Record<string, any> = {};

  registerProvider(name: string, providerInstance: any) {
    this.providers[name] = providerInstance;
  }

  getProvider(name: string) {
    return this.providers[name];
  }
}
