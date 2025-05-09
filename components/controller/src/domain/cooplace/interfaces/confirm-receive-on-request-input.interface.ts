import type { Cooperative, MarketContract } from 'cooptypes';
import type { ISignedDocumentDomainInterface } from '~/domain/document/interfaces/signed-document-domain.interface';

export type ConfirmReceiveOnRequestInputDomainInterface = Omit<
  MarketContract.Actions.ConfirmReceive.IConfirmReceive,
  'document'
> & {
  document: ISignedDocumentDomainInterface<Cooperative.Registry.ReturnByAssetAct.Action>;
};
