import { Injectable, Logger } from '@nestjs/common';
import { Client } from '@opensearch-project/opensearch';

export interface SearchIndexConfig {
  name: string;
  mappings: Record<string, any>;
  settings?: Record<string, any>;
}

export interface SearchableItem {
  id: string;
  [key: string]: any;
}

export interface SearchOptions {
  fields: string[];
  boosts?: Record<string, number>;
  size?: number;
  filter?: Record<string, any>[];
  highlightFields?: string[];
}

export interface SearchHitGeneric {
  id: string;
  score: number;
  source: Record<string, any>;
  highlights: string[];
}

@Injectable()
export class SearchRegistryService {
  private client: Client | null = null;
  private readonly logger = new Logger(SearchRegistryService.name);
  private readonly enabled: boolean;
  private readonly registeredIndexes = new Map<string, SearchIndexConfig>();

  constructor() {
    this.enabled = process.env.OPENSEARCH_ENABLED === 'true';
  }

  async onModuleInit() {
    if (!this.enabled) {
      this.logger.log('Поисковый движок отключён (OPENSEARCH_ENABLED != true)');
      return;
    }

    const node = process.env.OPENSEARCH_NODE || 'https://opensearch:9200';
    const username = process.env.OPENSEARCH_USERNAME || 'admin';
    const password = process.env.OPENSEARCH_PASSWORD || '';

    this.client = new Client({
      node,
      auth: { username, password },
      ssl: { rejectUnauthorized: false },
    });

    try {
      const info = await this.client.info();
      this.logger.log(`OpenSearch подключён: ${info.body.version.number}`);
    } catch (error: any) {
      this.logger.warn(`OpenSearch недоступен: ${error.message}. Поиск будет отключён.`);
      this.client = null;
    }
  }

  isAvailable(): boolean {
    return this.enabled && this.client !== null;
  }

  async registerIndex(config: SearchIndexConfig): Promise<void> {
    this.registeredIndexes.set(config.name, config);

    if (!this.client) return;

    try {
      const exists = await this.client.indices.exists({ index: config.name });
      if (!exists.body) {
        await this.client.indices.create({
          index: config.name,
          body: {
            settings: config.settings || {},
            mappings: { properties: config.mappings },
          },
        });
        this.logger.log(`Индекс "${config.name}" создан`);
      }
    } catch (error: any) {
      this.logger.warn(`Ошибка создания индекса "${config.name}": ${error.message}`);
    }
  }

  async index(indexName: string, item: SearchableItem): Promise<void> {
    if (!this.client) return;

    try {
      await this.client.index({
        index: indexName,
        id: item.id,
        body: item,
        refresh: true,
      });
    } catch (error: any) {
      this.logger.warn(`Ошибка индексации в "${indexName}": ${error.message}`);
    }
  }

  async search(indexName: string, query: string, options: SearchOptions): Promise<SearchHitGeneric[]> {
    if (!this.client) return [];

    try {
      const fields = options.fields.map(f => {
        const boost = options.boosts?.[f];
        return boost ? `${f}^${boost}` : f;
      });

      const must: any[] = [{
        multi_match: {
          query,
          fields,
          type: 'best_fields',
          fuzziness: 'AUTO',
        },
      }];

      const result = await this.client.search({
        index: indexName,
        body: {
          size: options.size || 20,
          query: {
            bool: {
              must,
              filter: options.filter || [],
            },
          },
          highlight: options.highlightFields ? {
            fields: Object.fromEntries(
              options.highlightFields.map(f => [f, { number_of_fragments: 3, fragment_size: 150 }]),
            ),
            pre_tags: ['<mark>'],
            post_tags: ['</mark>'],
          } : undefined,
        },
      });

      return (result.body.hits?.hits || []).map((hit: any) => ({
        id: hit._id,
        score: hit._score,
        source: hit._source,
        highlights: Object.values(hit.highlight || {}).flat() as string[],
      }));
    } catch (error: any) {
      this.logger.warn(`Ошибка поиска в "${indexName}": ${error.message}`);
      return [];
    }
  }

  async deleteIndex(indexName: string): Promise<void> {
    if (!this.client) return;
    try {
      await this.client.indices.delete({ index: indexName });
    } catch {}
  }

  getRegisteredIndexes(): string[] {
    return Array.from(this.registeredIndexes.keys());
  }
}
