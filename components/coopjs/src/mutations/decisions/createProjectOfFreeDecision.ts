import { createdProjectFreeDecisionSelector } from '../../selectors/decisions';
import { $, Selector, type GraphQLTypes, type InputType, type ModelTypes } from '../../zeus';

type inputModel = ModelTypes['CreateProjectFreeDecisionInput'];

export const name = 'createProjectOfFreeDecision'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'CreateProjectFreeDecisionInput!') }, createdProjectFreeDecisionSelector]
});

export interface IInput extends inputModel {}
export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>;
