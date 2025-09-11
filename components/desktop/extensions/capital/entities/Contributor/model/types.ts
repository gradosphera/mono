import type { Queries, Mutations } from '@coopenomics/sdk';

export type IContributor =
  Queries.Capital.GetContributor.IOutput[typeof Queries.Capital.GetContributor.name];
export type IContributorsPagination =
  Queries.Capital.GetContributors.IOutput[typeof Queries.Capital.GetContributors.name];

export type IGetContributorInput =
  Queries.Capital.GetContributor.IInput['data'];
export type IGetContributorsInput = Queries.Capital.GetContributors.IInput;
export type IRegisterContributorInput =
  Mutations.Capital.RegisterContributor.IInput['data'];
export type IRegisterContributorOutput =
  Mutations.Capital.RegisterContributor.IOutput[typeof Mutations.Capital.RegisterContributor.name];
export type IImportContributorInput =
  Mutations.Capital.ImportContributor.IInput['data'];
export type IImportContributorOutput =
  Mutations.Capital.ImportContributor.IOutput[typeof Mutations.Capital.ImportContributor.name];
