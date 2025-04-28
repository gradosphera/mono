import type { Queries, Mutations } from '@coopenomics/sdk';

export type IMeet = Queries.Meet.GetMeet.IOutput[typeof Queries.Meet.GetMeet.name]
export type IGetMeetsInput = Queries.Meet.GetMeets.IInput['data']
export type IGetMeetInput = Queries.Meet.GetMeet.IInput['data']
export type ICloseMeetInput = Mutations.Meet.SignByPresiderOnAnnualGeneralMeet.IInput['data']
export type IRestartMeetInput = Mutations.Meet.RestartAnnualGeneralMeet.IInput['data']
