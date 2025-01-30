import type { Cooperative, MarketContract } from 'cooptypes';

export type AcceptChildOrderInputDomainInterface = Omit<MarketContract.Actions.AcceptRequest.IAcceptRequest, 'document'> & {
  document: Cooperative.Document.ISignedDocument<Cooperative.Registry.AssetContributionStatement.Action>;
};
