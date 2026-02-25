import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Client } from '@opensearch-project/opensearch';

const INDEX_NAME = 'documents';

export interface IndexableDocument {
  hash: string;
  full_title: string;
  html: string;
  username: string;
  coopname: string;
  registry_id: number;
  created_at: string;
}

export interface SearchHit {
  hash: string;
  full_title: string;
  username: string;
  coopname: string;
  registry_id: number;
  created_at: string;
  highlights: string[];
}

@Injectable()
export class OpenSearchService implements OnModuleInit {
  private client: Client | null = null;
  private readonly logger = new Logger(OpenSearchService.name);
  private readonly enabled: boolean;

  constructor() {
    this.enabled = process.env.OPENSEARCH_ENABLED === 'true';
  }

  async onModuleInit() {
    if (!this.enabled) {
      this.logger.log('OpenSearch отключён (OPENSEARCH_ENABLED != true)');
      return;
    }

    const node = process.env.OPENSEARCH_NODE || 'http://opensearch:9200';
    this.client = new Client({ node });

    try {
      await this.ensureIndex();
      this.logger.log('OpenSearch подключён и индекс готов');
    } catch (error) {
      this.logger.warn(`OpenSearch недоступен: ${error.message}. Поиск будет отключён.`);
      this.client = null;
    }
  }

  isAvailable(): boolean {
    return this.enabled && this.client !== null;
  }

  private async ensureIndex(): Promise<void> {
    if (!this.client) return;

    const exists = await this.client.indices.exists({ index: INDEX_NAME });
    if (exists.body) return;

    await this.client.indices.create({
      index: INDEX_NAME,
      body: {
        settings: {
          analysis: {
            analyzer: {
              russian_analyzer: {
                type: 'custom',
                tokenizer: 'standard',
                filter: ['lowercase', 'russian_stemmer'],
              },
            },
            filter: {
              russian_stemmer: {
                type: 'stemmer',
                language: 'russian',
              },
            },
          },
        },
        mappings: {
          properties: {
            hash: { type: 'keyword' },
            full_title: { type: 'text', analyzer: 'russian_analyzer' },
            html: { type: 'text', analyzer: 'russian_analyzer' },
            username: { type: 'keyword' },
            coopname: { type: 'keyword' },
            registry_id: { type: 'integer' },
            created_at: { type: 'date', ignore_malformed: true },
          },
        },
      },
    });
  }

  async indexDocument(doc: IndexableDocument): Promise<void> {
    if (!this.client) return;

    try {
      const htmlText = doc.html
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      await this.client.index({
        index: INDEX_NAME,
        id: doc.hash,
        body: {
          hash: doc.hash,
          full_title: doc.full_title,
          html: htmlText,
          username: doc.username,
          coopname: doc.coopname,
          registry_id: doc.registry_id,
          created_at: doc.created_at,
        },
        refresh: true,
      });
    } catch (error) {
      this.logger.warn(`Ошибка индексации документа ${doc.hash}: ${error.message}`);
    }
  }

  async search(query: string, coopname: string, limit = 20): Promise<SearchHit[]> {
    if (!this.client) return [];

    try {
      const result = await this.client.search({
        index: INDEX_NAME,
        body: {
          size: limit,
          query: {
            bool: {
              must: [
                {
                  multi_match: {
                    query,
                    fields: ['full_title^3', 'html', 'username^2'],
                    type: 'best_fields',
                    fuzziness: 'AUTO',
                  },
                },
              ],
              filter: [
                { term: { coopname } },
              ],
            },
          },
          highlight: {
            fields: {
              full_title: { number_of_fragments: 1 },
              html: { number_of_fragments: 3, fragment_size: 150 },
            },
            pre_tags: ['<mark>'],
            post_tags: ['</mark>'],
          },
        },
      });

      return (result.body.hits?.hits || []).map((hit: any) => ({
        hash: hit._source.hash,
        full_title: hit._source.full_title,
        username: hit._source.username,
        coopname: hit._source.coopname,
        registry_id: hit._source.registry_id,
        created_at: hit._source.created_at,
        highlights: [
          ...(hit.highlight?.full_title || []),
          ...(hit.highlight?.html || []),
        ],
      }));
    } catch (error) {
      this.logger.warn(`Ошибка поиска: ${error.message}`);
      return [];
    }
  }

  async reindexAll(documents: IndexableDocument[]): Promise<number> {
    if (!this.client) return 0;

    let count = 0;
    for (const doc of documents) {
      await this.indexDocument(doc);
      count++;
    }
    return count;
  }
}
