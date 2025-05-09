import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CandidateEntity } from '../entities/candidate.entity';
import type { CandidateRepository } from '~/domain/account/repository/candidate.repository';
import type { CandidateDomainInterface } from '~/domain/account/interfaces/candidate-domain.interface';
import type { ISignedDocumentDomainInterface } from '~/domain/document/interfaces/signed-document-domain.interface';

@Injectable()
export class TypeOrmCandidateRepository implements CandidateRepository {
  constructor(
    @InjectRepository(CandidateEntity)
    private readonly candidateRepository: Repository<CandidateEntity>
  ) {}

  async findByUsername(username: string): Promise<CandidateDomainInterface | null> {
    const candidate = await this.candidateRepository.findOneBy({ username });
    if (!candidate) return null;

    return this.mapToDomainEntity(candidate);
  }

  async findByRegistrationHash(hash: string): Promise<CandidateDomainInterface | null> {
    const candidate = await this.candidateRepository.findOneBy({ registration_hash: hash });
    if (!candidate) return null;

    return this.mapToDomainEntity(candidate);
  }

  async create(data: CandidateDomainInterface): Promise<CandidateDomainInterface> {
    const candidate = new CandidateEntity();
    candidate.username = data.username;
    candidate.coopname = data.coopname;
    candidate.braname = data.braname || '';
    candidate.status = data.status;
    candidate.type = data.type;
    candidate.created_at = data.created_at;
    candidate.registration_hash = data.registration_hash;
    candidate.referer = data.referer;
    candidate.public_key = data.public_key;
    candidate.meta = data.meta;

    const createdEntity = await this.candidateRepository.save(candidate);
    return this.mapToDomainEntity(createdEntity);
  }

  async update(username: string, data: Partial<CandidateDomainInterface>): Promise<CandidateDomainInterface | null> {
    const candidate = await this.candidateRepository.findOneBy({ username });
    if (!candidate) return null;

    if (data.status) candidate.status = data.status;
    if (data.type) candidate.type = data.type;
    if (data.braname) candidate.braname = data.braname;
    if (data.registration_hash) candidate.registration_hash = data.registration_hash;

    if (data.documents) {
      if (data.documents.statement) candidate.statement = data.documents.statement;
      if (data.documents.wallet_agreement) candidate.wallet_agreement = data.documents.wallet_agreement;
      if (data.documents.signature_agreement) candidate.signature_agreement = data.documents.signature_agreement;
      if (data.documents.privacy_agreement) candidate.privacy_agreement = data.documents.privacy_agreement;
      if (data.documents.user_agreement) candidate.user_agreement = data.documents.user_agreement;
    }

    const updatedEntity = await this.candidateRepository.save(candidate);
    return this.mapToDomainEntity(updatedEntity);
  }

  async saveDocument(
    username: string,
    documentType: 'statement' | 'wallet_agreement' | 'signature_agreement' | 'privacy_agreement' | 'user_agreement',
    document: ISignedDocumentDomainInterface
  ): Promise<void> {
    const candidate = await this.candidateRepository.findOneBy({ username });
    if (!candidate) {
      throw new Error(`Кандидат с username ${username} не найден`);
    }

    switch (documentType) {
      case 'statement':
        candidate.statement = document;
        break;
      case 'wallet_agreement':
        candidate.wallet_agreement = document;
        break;
      case 'signature_agreement':
        candidate.signature_agreement = document;
        break;
      case 'privacy_agreement':
        candidate.privacy_agreement = document;
        break;
      case 'user_agreement':
        candidate.user_agreement = document;
        break;
    }

    await this.candidateRepository.save(candidate);
  }

  private mapToDomainEntity(entity: CandidateEntity): CandidateDomainInterface {
    return {
      username: entity.username,
      coopname: entity.coopname,
      braname: entity.braname,
      status: entity.status,
      type: entity.type,
      created_at: entity.created_at,
      documents: {
        statement: entity.statement,
        wallet_agreement: entity.wallet_agreement,
        signature_agreement: entity.signature_agreement,
        privacy_agreement: entity.privacy_agreement,
        user_agreement: entity.user_agreement,
      },
      registration_hash: entity.registration_hash,
      referer: entity.referer,
      public_key: entity.public_key,
      meta: entity.meta,
    };
  }
}
