import type { Cooperative, MarketContract } from 'cooptypes';
import type { ISignedDocumentDomainInterface } from '~/domain/document/interfaces/signed-document-domain.interface';

export type CreateChildOrderInputDomainInterface = {
  params: Omit<MarketContract.Actions.CreateOrder.ICreateOrder['params'], 'document'> & {
    document: ISignedDocumentDomainInterface<Cooperative.Registry.AssetContributionStatement.Action>;
  };
};
