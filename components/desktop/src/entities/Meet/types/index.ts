import type { Queries } from '@coopenomics/sdk';

export type IMeet = Queries.Meet.GetMeet.IOutput[typeof Queries.Meet.GetMeet.name]
export type IGetMeetsInput = Queries.Meet.GetMeets.IInput['data']
export type IGetMeetInput = Queries.Meet.GetMeet.IInput['data']
