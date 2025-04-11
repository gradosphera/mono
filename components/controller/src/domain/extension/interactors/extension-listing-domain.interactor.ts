import { Injectable } from '@nestjs/common';
import { ExtensionDomainListingService } from '../services/extension-listing-domain.service';
import { ExtensionDTO } from '~/modules/appstore/dto/extension-graphql.dto';
import { GetExtensionsGraphQLInput } from '~/modules/appstore/dto/get-extensions-input.dto';

@Injectable()
export class ExtensionDomainListingInteractor<TConfig = any> {
  constructor(private readonly listingService: ExtensionDomainListingService<TConfig>) {}

  /**
   * Возвращает список доступных/установленных расширений, с фильтрами
   */
  async getCombinedAppList(filter?: GetExtensionsGraphQLInput): Promise<ExtensionDTO<TConfig>[]> {
    return this.listingService.getCombinedAppList(filter);
  }

  /**
   * Возвращает DTO одного расширения
   */
  async getCombinedApp(name: string): Promise<ExtensionDTO<TConfig> | null> {
    return this.listingService.getCombinedApp(name);
  }

  /**
   * Проверить конфиг по схеме
   */
  validateConfig(name: string, config: any): void {
    return this.listingService.validateConfig(name, config);
  }
}
