import type { Cooperative, MarketContract } from 'cooptypes';

export type ConfirmSupplyOnRequestInputDomainInterface = Omit<
  MarketContract.Actions.ConfirmSupply.IConfirmSupply,
  'document'
> & {
  document: Cooperative.Document.ISignedDocument<Cooperative.Registry.AssetContributionAct.Action>;
};
