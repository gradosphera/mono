import type { MeetProcessedDomainInterface } from '../interfaces/meet-processed-domain.interface';
import type { ISignedDocumentDomainInterface } from '~/domain/document/interfaces/signed-document-domain.interface';

export class MeetProcessedDomainEntity implements MeetProcessedDomainInterface {
  public readonly coopname!: string;
  public readonly hash!: string;
  public readonly results!: any[];
  public readonly signed_ballots!: number;
  public readonly quorum_percent!: number;
  public readonly quorum_passed!: boolean;
  public readonly decision!: ISignedDocumentDomainInterface;

  constructor(data: Partial<MeetProcessedDomainInterface> & { decision: ISignedDocumentDomainInterface }) {
    this.coopname = data.coopname || '';
    this.hash = data.hash || '';
    this.results = data.results || [];
    this.signed_ballots = data.signed_ballots || 0;
    this.quorum_percent = data.quorum_percent || 0;
    this.quorum_passed = data.quorum_passed || false;
    this.decision = data.decision;
  }
}
