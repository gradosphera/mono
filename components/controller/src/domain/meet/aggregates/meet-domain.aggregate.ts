import { DataLifecycleState } from '~/domain/common/value-objects/data-lifecycle-state';
import type { MeetPreProcessingDomainEntity } from '../entities/meet-pre-domain.entity';
import type { MeetProcessedDomainEntity } from '../entities/meet-processed-domain.entity';
import type { MeetProcessingDomainEntity } from '../entities/meet-processing-domain.entity';
import { assertSingleHash } from '~/shared/asserts/single-hash.assert';
import type { MeetDomainAggregate } from '../interfaces/meet-aggregate.interface';

export class MeetAggregate implements MeetDomainAggregate {
  public readonly hash: string;

  constructor(
    public readonly pre?: MeetPreProcessingDomainEntity | null,
    public readonly processing?: MeetProcessingDomainEntity | null,
    public readonly processed?: MeetProcessedDomainEntity | null
  ) {
    console.log('hash: ', pre?.hash, processing, processed?.hash);
    this.hash = assertSingleHash(pre?.hash, processing?.hash, processed?.hash);
  }

  getState(): DataLifecycleState {
    if (this.processed) return DataLifecycleState.Processed;
    if (this.processing) return DataLifecycleState.Processing;
    if (this.pre) return DataLifecycleState.PreProcessing;
    throw new Error('Cannot determine lifecycle state');
  }
}
