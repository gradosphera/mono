import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SearchRegistryService, type SearchHitGeneric } from './search-registry.service';

const INDEX_NAME = 'documents';

const RUSSIAN_ANALYZER_SETTINGS = {
  index: {
    max_ngram_diff: 13
  },
  analysis: {
    analyzer: {
      russian_analyzer: {
        type: 'custom',
        tokenizer: 'standard',
        filter: ['lowercase', 'russian_stemmer'],
      },
      russian_ngram_analyzer: {
        type: 'custom',
        tokenizer: 'standard',
        filter: [
          'lowercase',
          'russian_stemmer',
          'ngram_filter'
        ]
      }
    },
    filter: {
      russian_stemmer: { type: 'stemmer', language: 'russian' },
      ngram_filter: {
        type: 'ngram',
        min_gram: 2,
        max_gram: 15,
        token_chars: ['letter', 'digit']
      }
    },
  },
};

const DOCUMENT_MAPPINGS = {
  hash: { type: 'keyword' },
  full_title: {
    type: 'text',
    analyzer: 'russian_ngram_analyzer',
    search_analyzer: 'russian_analyzer'
  },
  html: {
    type: 'text',
    analyzer: 'russian_ngram_analyzer',
    search_analyzer: 'russian_analyzer'
  },
  username: {
    type: 'text',
    analyzer: 'russian_ngram_analyzer',
    search_analyzer: 'russian_analyzer',
    fields: {
      keyword: { type: 'keyword' }
    }
  },
  coopname: { type: 'keyword' },
  registry_id: { type: 'integer' },
  created_at: { type: 'date', ignore_malformed: true },
};

export interface IndexableDocument {
  hash: string;
  full_title: string;
  html: string;
  username: string;
  coopname: string;
  registry_id: number;
  created_at: string;
}

export interface DocumentSearchHit {
  hash: string;
  full_title: string;
  username: string;
  coopname: string;
  registry_id: number;
  created_at: string;
  highlights: string[];
}

@Injectable()
export class DocumentSearchService implements OnModuleInit {
  private readonly logger = new Logger(DocumentSearchService.name);

  constructor(private readonly registry: SearchRegistryService) {}

  async onModuleInit() {
    if (!this.registry.isAvailable()) return;

    await this.registry.registerIndex({
      name: INDEX_NAME,
      mappings: DOCUMENT_MAPPINGS,
      settings: RUSSIAN_ANALYZER_SETTINGS,
    });

    this.logger.log('Индекс документов зарегистрирован');
  }

  isAvailable(): boolean {
    return this.registry.isAvailable();
  }

  async indexDocument(doc: IndexableDocument): Promise<void> {
    const htmlText = doc.html
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    await this.registry.index(INDEX_NAME, {
      id: doc.hash,
      hash: doc.hash,
      full_title: doc.full_title,
      html: htmlText,
      username: doc.username,
      coopname: doc.coopname,
      registry_id: doc.registry_id,
      created_at: doc.created_at,
    });
  }

  async search(query: string, coopname: string, limit = 20): Promise<DocumentSearchHit[]> {
    const hits = await this.registry.search(INDEX_NAME, query, {
      fields: ['full_title', 'html', 'username'],
      boosts: { full_title: 3, username: 2 },
      size: limit,
      filter: [{ term: { coopname } }],
      highlightFields: ['full_title', 'html'],
    });

    return hits.map((hit: SearchHitGeneric) => ({
      hash: hit.source.hash,
      full_title: hit.source.full_title,
      username: hit.source.username,
      coopname: hit.source.coopname,
      registry_id: hit.source.registry_id,
      created_at: hit.source.created_at,
      highlights: hit.highlights,
    }));
  }
}
