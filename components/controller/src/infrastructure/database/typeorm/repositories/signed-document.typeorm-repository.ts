import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SignedDocumentEntity } from '../entities/signed-document.entity';
import { SignedDocumentStatus } from '~/domain/document/enums/signed-document-status.enum';
import type {
  SignedDocumentRepository,
  SignedDocumentSearchHit,
  SignedDocumentSearchParams,
  SignedDocumentUpsertInput,
} from '~/domain/document/repository/signed-document.repository';

/**
 * Реализация репозитория реестра подписанных документов на базе TypeORM.
 */
@Injectable()
export class SignedDocumentTypeormRepository implements SignedDocumentRepository {
  constructor(
    @InjectRepository(SignedDocumentEntity)
    private readonly repository: Repository<SignedDocumentEntity>
  ) {}

  async upsert(input: SignedDocumentUpsertInput): Promise<void> {
    const existing = await this.repository.findOne({
      where: { coopname: input.coopname, packageHash: input.packageHash },
    });

    if (existing) {
      this.repository.merge(existing, this.toColumns(input));
      await this.repository.save(existing);
      return;
    }

    await this.repository.save(this.repository.create(this.toColumns(input)));
  }

  async setStatus(coopname: string, packageHash: string, status: SignedDocumentStatus): Promise<boolean> {
    const result = await this.repository.update({ coopname, packageHash }, { status });
    return (result.affected ?? 0) > 0;
  }

  async getStatus(coopname: string, packageHash: string): Promise<SignedDocumentStatus | null> {
    const entity = await this.repository.findOne({
      where: { coopname, packageHash },
      select: ['status'],
    });
    return entity ? entity.status : null;
  }

  async exists(coopname: string, packageHash: string): Promise<boolean> {
    const count = await this.repository.count({ where: { coopname, packageHash } });
    return count > 0;
  }

  async search(params: SignedDocumentSearchParams): Promise<SignedDocumentSearchHit[]> {
    const qb = this.repository.createQueryBuilder('d').where('d.coopname = :coopname', { coopname: params.coopname });

    const query = params.query?.trim();
    if (query) {
      qb.andWhere('(d.full_title ILIKE :q OR d.username ILIKE :q OR d.content_text ILIKE :q)', { q: `%${query}%` });
    }

    qb.orderBy('d.document_created_at', 'DESC', 'NULLS LAST').limit(params.limit);

    const rows = await qb.getMany();

    return rows.map((row) => ({
      hash: row.hash,
      full_title: row.full_title,
      username: row.username,
      coopname: row.coopname,
      registry_id: row.registry_id,
      created_at: row.document_created_at ? row.document_created_at.toISOString() : null,
      highlights: [],
    }));
  }

  private toColumns(input: SignedDocumentUpsertInput): Partial<SignedDocumentEntity> {
    return {
      coopname: input.coopname,
      packageHash: input.packageHash,
      hash: input.hash,
      username: input.username,
      status: input.status,
      registry_id: input.registry_id,
      full_title: input.full_title,
      content_text: input.content_text,
      html: input.html,
      pdf: input.pdf,
      block_num: input.block_num,
      document_aggregate: input.document_aggregate,
      meta: input.meta,
      document_created_at: input.document_created_at,
    };
  }
}
