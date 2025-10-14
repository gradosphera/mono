import type { Mutations } from '@coopenomics/sdk';

export type ISignActAsContributorInput = Mutations.Capital.SignActAsContributor.IInput['data'];
export type ISignActAsContributorOutput =
  Mutations.Capital.SignActAsContributor.IOutput[typeof Mutations.Capital.SignActAsContributor.name];

export type ISignActAsChairmanInput = Mutations.Capital.SignActAsChairman.IInput['data'];
export type ISignActAsChairmanOutput =
  Mutations.Capital.SignActAsChairman.IOutput[typeof Mutations.Capital.SignActAsChairman.name];
