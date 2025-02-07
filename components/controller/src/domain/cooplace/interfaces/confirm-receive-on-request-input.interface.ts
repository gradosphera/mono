import type { Cooperative, MarketContract } from 'cooptypes';

export type ConfirmReceiveOnRequestInputDomainInterface = Omit<
  MarketContract.Actions.ConfirmReceive.IConfirmReceive,
  'document'
> & {
  document: Cooperative.Document.ISignedDocument<Cooperative.Registry.ReturnByAssetAct.Action>;
};
