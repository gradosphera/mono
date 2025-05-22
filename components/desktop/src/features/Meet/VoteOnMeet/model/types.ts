import { Mutations } from '@coopenomics/sdk';

export type IVoteOnMeetInput = Mutations.Meet.VoteOnAnnualGeneralMeet.IInput['data'];
export type IVoteOnMeetResult = Mutations.Meet.VoteOnAnnualGeneralMeet.IOutput[typeof Mutations.Meet.VoteOnAnnualGeneralMeet.name];
