import { $, Selector, type ModelTypes } from '../../zeus';

export const publishProjectOfFreeDecision = Selector('Mutation')({
  publishProjectOfFreeDecision: [{data: $('data', 'CreateProjectFreeDecision!')}, true]
});

export type IPublishProjectOfFreeDecision = ModelTypes['CreateProjectFreeDecision']
