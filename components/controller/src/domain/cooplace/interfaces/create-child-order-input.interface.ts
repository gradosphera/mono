import type { Cooperative, MarketContract } from 'cooptypes';

export type CreateChildOrderInputDomainInterface = {
  params: Omit<MarketContract.Actions.CreateOrder.ICreateOrder['params'], 'document'> & {
    document: Cooperative.Document.ISignedDocument<Cooperative.Registry.AssetContributionStatement.Action>;
  };
};
