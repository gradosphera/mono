import type { Cooperative, SovietContract } from 'cooptypes';

export type SelectBranchInputDomainInterface = Omit<
  SovietContract.Actions.Branches.SelectBranch.ISelectBranch,
  'document'
> & {
  document: Cooperative.Document.ISignedDocument<Cooperative.Registry.SelectBranchStatement.Action>;
};
