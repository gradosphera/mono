import type { Cooperative, MarketContract } from 'cooptypes';
import type { ISignedDocumentDomainInterface } from '~/domain/document/interfaces/signed-document-domain.interface';

export type ReceiveOnRequestInputDomainInterface = Omit<
  MarketContract.Actions.ReceiveOnRequest.IReceiveOnRequest,
  'document'
> & {
  document: ISignedDocumentDomainInterface<Cooperative.Registry.ReturnByAssetAct.Action>;
};
