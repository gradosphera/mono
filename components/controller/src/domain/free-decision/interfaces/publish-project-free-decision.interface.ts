import type { Cooperative, SovietContract } from 'cooptypes';
import type { ISignedDocumentDomainInterface } from '~/domain/document/interfaces/signed-document-domain.interface';

export type PublishProjectFreeDecisionInputDomainInterface = Omit<
  SovietContract.Actions.Decisions.CreateFreeDecision.ICreateFreeDecision,
  'document'
> & {
  document: ISignedDocumentDomainInterface<Cooperative.Registry.ProjectFreeDecision.Action>;
};
