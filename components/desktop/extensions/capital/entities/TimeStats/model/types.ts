import type { Queries } from '@coopenomics/sdk';

export type ITimeStatsPagination =
  Queries.Capital.GetTimeStats.IOutput[typeof Queries.Capital.GetTimeStats.name];

export type ITimeStat = Queries.Capital.GetTimeStats.IOutput[typeof Queries.Capital.GetTimeStats.name]['items'][0];

export type IGetTimeStatsInput = Queries.Capital.GetTimeStats.IInput;
