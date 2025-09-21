import type { Queries } from '@coopenomics/sdk';

export type ITimeEntriesPagination =
  Queries.Capital.GetTimeEntries.IOutput[typeof Queries.Capital.GetTimeEntries.name];

export type ITimeEntry = Queries.Capital.GetTimeEntries.IOutput[typeof Queries.Capital.GetTimeEntries.name]['items'][0];

export type IGetTimeEntriesInput = Queries.Capital.GetTimeEntries.IInput;
