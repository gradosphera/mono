import type { Cooperative, MarketContract } from 'cooptypes';

export type SupplyOnRequestInputDomainInterface = Omit<
  MarketContract.Actions.SupplyOnRequest.ISupplyOnRequest,
  'document'
> & {
  document: Cooperative.Document.ISignedDocument<Cooperative.Registry.AssetContributionAct.Action>;
};
