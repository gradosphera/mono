import { type ISignedDocumentDomainInterface } from '~/domain/document/interfaces/signed-document-domain.interface';

export interface NotifyOnAnnualGeneralMeetInputDomainInterface {
  coopname: string;
  meet_hash: string;
  username: string;
  notification: ISignedDocumentDomainInterface;
}
