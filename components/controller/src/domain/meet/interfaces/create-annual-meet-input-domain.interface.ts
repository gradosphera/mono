import type { Cooperative, MeetContract } from 'cooptypes';

export type CreateAnnualGeneralMeetInputDomainInterface = Omit<
  MeetContract.Actions.CreateMeet.IInput,
  'proposal' | 'open_at' | 'close_at'
> & {
  proposal: Cooperative.Document.ISignedDocument<Cooperative.Registry.AnnualGeneralMeetingAgenda.Meta>;
  open_at: Date;
  close_at: Date;
};
