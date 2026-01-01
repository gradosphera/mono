import { Injectable } from '@nestjs/common';
import { ProviderPort } from '~/domain/gateway/ports/provider.port';
import { ProviderDomainService } from '~/domain/gateway/provider-domain.service';

@Injectable()
export class ProviderAdapter implements ProviderPort {
  constructor(private readonly providerService: ProviderDomainService) {}

  registerProvider(name: string, providerInstance: any): void {
    this.providerService.registerProvider(name, providerInstance);
  }

  getProvider(name: string): any {
    return this.providerService.getProvider(name);
  }
}
