/**
 * Порт для регистрации платежных провайдеров
 */
export interface ProviderPort {
  registerProvider(name: string, providerInstance: any): void;
  getProvider(name: string): any;
}

export const PROVIDER_PORT = Symbol('ProviderPort');
