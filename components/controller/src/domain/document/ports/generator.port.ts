import type { ISearchResult } from '@coopenomics/factory';
import type { Cooperative } from 'cooptypes';

export interface GeneratorPort {
  connect(url: string): Promise<void>;
  disconnect(): Promise<void>;
  generate(
    data: Cooperative.Document.IGenerate,
    options?: Cooperative.Document.IGenerationOptions
  ): Promise<Cooperative.Document.IGeneratedDocument>;
  getDocument(query: { hash: string }): Promise<Cooperative.Document.IGeneratedDocument | null>;
  get<T = any>(collection: string, query: Record<string, any>): Promise<T | null>;
  save(collection: string, data: any): Promise<void>;
  del(collection: string, query: Record<string, any>): Promise<void>;
  list<T = any>(collection: string, filter?: Record<string, any>): Promise<Cooperative.Document.IGetResponse<T>>;
  search(query: string): Promise<ISearchResult[]>;
}

export const GENERATOR_PORT = Symbol('GeneratorPort');
