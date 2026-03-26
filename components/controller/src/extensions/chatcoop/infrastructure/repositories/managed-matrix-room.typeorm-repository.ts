import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type {
  ChatcoopManagedMatrixRoomRepository,
  UpsertManagedMatrixRoomInput,
} from '../../domain/repositories/managed-matrix-room.repository';
import type { ManagedMatrixRoomDomainEntity } from '../../domain/entities/managed-matrix-room.entity';
import type { ChatcoopManagedMatrixRoomKind } from '../../domain/entities/managed-matrix-room.entity';
import { ManagedMatrixRoomTypeormEntity } from '../entities/managed-matrix-room.typeorm-entity';
import { ManagedMatrixRoomMapper } from '../mappers/managed-matrix-room.mapper';

@Injectable()
export class ManagedMatrixRoomTypeormRepository implements ChatcoopManagedMatrixRoomRepository {
  constructor(
    @InjectRepository(ManagedMatrixRoomTypeormEntity)
    private readonly repository: Repository<ManagedMatrixRoomTypeormEntity>
  ) {}

  async upsertRoom(input: UpsertManagedMatrixRoomInput): Promise<ManagedMatrixRoomDomainEntity> {
    const existing = await this.repository.findOne({ where: { matrixRoomId: input.matrixRoomId } });
    const secretaryInRoom =
      input.secretaryInRoom !== undefined
        ? input.secretaryInRoom
        : (existing?.secretaryInRoom ?? false);

    await this.repository.upsert(
      {
        matrixRoomId: input.matrixRoomId,
        encrypted: input.encrypted,
        roomKind: input.kind,
        displayLabel: input.displayLabel,
        projectHash: input.projectHash,
        secretaryInRoom,
      },
      { conflictPaths: ['matrixRoomId'] }
    );
    const row = await this.repository.findOneOrFail({ where: { matrixRoomId: input.matrixRoomId } });
    return ManagedMatrixRoomMapper.toDomain(row);
  }

  async findByMatrixRoomId(matrixRoomId: string): Promise<ManagedMatrixRoomDomainEntity | null> {
    const row = await this.repository.findOne({ where: { matrixRoomId } });
    return row ? ManagedMatrixRoomMapper.toDomain(row) : null;
  }

  async findByKind(kind: ChatcoopManagedMatrixRoomKind): Promise<ManagedMatrixRoomDomainEntity[]> {
    const rows = await this.repository.find({ where: { roomKind: kind } });
    return rows.map(ManagedMatrixRoomMapper.toDomain);
  }

  async findByProjectHash(projectHash: string): Promise<ManagedMatrixRoomDomainEntity[]> {
    const rows = await this.repository.find({
      where: { roomKind: 'capital_project', projectHash },
    });
    return rows.map(ManagedMatrixRoomMapper.toDomain);
  }

  async findEligibleForSecretaryTranscription(): Promise<ManagedMatrixRoomDomainEntity[]> {
    const rows = await this.repository.find({ where: { encrypted: false } });
    return rows.map(ManagedMatrixRoomMapper.toDomain);
  }

  async setSecretaryInRoom(matrixRoomId: string, secretaryInRoom: boolean): Promise<void> {
    await this.repository.update({ matrixRoomId }, { secretaryInRoom });
  }
}
