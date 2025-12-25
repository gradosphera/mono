// infrastructure/generator/generator.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import httpStatus from 'http-status';
import { DocumentDomainEntity } from '~/domain/document/entity/document-domain.entity';
import type { GenerateDocumentDomainInterfaceWithOptions } from '~/domain/document/interfaces/generate-document-domain-with-options.interface';
import { HttpApiError } from '~/errors/http-api-error';
import { GeneratorPort } from '~/domain/document/ports/generator.port';
import { Generator } from '@coopenomics/factory';
import type { Cooperative } from 'cooptypes';
import config from '~/config/config';

@Injectable()
export class GeneratorInfrastructureService implements GeneratorPort, OnModuleInit {
  private generator = new Generator();

  async onModuleInit() {
    await this.connect(config.mongoose.url);
  }

  async connect(url: string): Promise<void> {
    await this.generator.connect(url);
  }

  async disconnect(): Promise<void> {
    await this.generator.disconnect();
  }

  async generate(
    data: Cooperative.Document.IGenerate,
    options?: Cooperative.Document.IGenerationOptions
  ): Promise<Cooperative.Document.IGeneratedDocument> {
    return await this.generator.generate(data, options);
  }

  async getDocument(query: { hash: string }): Promise<Cooperative.Document.IGeneratedDocument | null> {
    return await this.generator.getDocument(query);
  }

  async get<T = any>(collection: string, query: Record<string, any>): Promise<T | null> {
    return await (this.generator as any).get(collection as any, query);
  }

  async save(collection: string, data: any): Promise<void> {
    await (this.generator as any).save(collection as any, data);
  }

  async del(collection: string, query: Record<string, any>): Promise<void> {
    await (this.generator as any).del(collection as any, query);
  }

  async list<T = any>(collection: string, filter?: Record<string, any>): Promise<Cooperative.Document.IGetResponse<T>> {
    return await (this.generator as any).list(collection as any, filter);
  }

  async search(query: string): Promise<import('@coopenomics/factory').ISearchResult[]> {
    return await this.generator.search(query);
  }

  async generateDocument(body: GenerateDocumentDomainInterfaceWithOptions): Promise<DocumentDomainEntity> {
    try {
      return new DocumentDomainEntity(await this.generate(body.data, body.options));
    } catch (error) {
      console.error('Ошибка при генерации документа:', error);
      throw new HttpApiError(httpStatus.BAD_REQUEST, 'Ошибка при генерации документа');
    }
  }
}
