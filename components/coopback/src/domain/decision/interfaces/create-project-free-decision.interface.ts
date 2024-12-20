import type { Cooperative, SovietContract } from 'cooptypes';

export type CreateProjectFreeDecisionInputDomainInterface = Omit<
  SovietContract.Actions.Decisions.CreateFreeDecision.ICreateFreeDecision,
  'document'
> & {
  document: Cooperative.Document.ISignedDocument<Cooperative.Registry.ProjectFreeDecision.Action>;
};
