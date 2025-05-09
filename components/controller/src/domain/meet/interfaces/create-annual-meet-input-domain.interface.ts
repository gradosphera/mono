import type { Cooperative, MeetContract } from 'cooptypes';
import type { ISignedDocumentDomainInterface } from '~/domain/document/interfaces/signed-document-domain.interface';

export type CreateAnnualGeneralMeetInputDomainInterface = Omit<
  MeetContract.Actions.CreateMeet.IInput,
  'proposal' | 'open_at' | 'close_at'
> & {
  proposal: ISignedDocumentDomainInterface<Cooperative.Registry.AnnualGeneralMeetingAgenda.Meta>;
  open_at: Date;
  close_at: Date;
};
