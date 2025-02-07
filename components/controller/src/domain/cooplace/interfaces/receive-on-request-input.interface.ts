import type { Cooperative, MarketContract } from 'cooptypes';

export type ReceiveOnRequestInputDomainInterface = Omit<
  MarketContract.Actions.ReceiveOnRequest.IReceiveOnRequest,
  'document'
> & {
  document: Cooperative.Document.ISignedDocument<Cooperative.Registry.ReturnByAssetAct.Action>;
};
