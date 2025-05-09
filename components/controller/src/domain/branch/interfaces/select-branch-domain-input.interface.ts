import type { Cooperative, SovietContract } from 'cooptypes';
import type { ISignedDocumentDomainInterface } from '~/domain/document/interfaces/signed-document-domain.interface';

export type SelectBranchInputDomainInterface = Omit<
  SovietContract.Actions.Branches.SelectBranch.ISelectBranch,
  'document'
> & {
  document: ISignedDocumentDomainInterface<Cooperative.Registry.SelectBranchStatement.Action>;
};
