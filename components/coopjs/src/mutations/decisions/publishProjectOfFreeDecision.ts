import { $, Selector, type GraphQLTypes, type InputType, type ModelTypes } from '../../zeus';

type inputModel = ModelTypes['PublishProjectFreeDecisionInput']

export const name = 'publishProjectOfFreeDecision'

export const mutation = Selector('Mutation')({
  [name]: [{data: $('data', 'PublishProjectFreeDecisionInput!')}, true]
});

export interface IInput extends inputModel {}
export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>;
