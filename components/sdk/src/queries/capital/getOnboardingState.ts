import { capitalOnboardingStateSelector } from '../../selectors'
import { type GraphQLTypes, type InputType, Selector } from '../../zeus'

export const name = 'getCapitalOnboardingState'

export const query = Selector('Query')({
  [name]: capitalOnboardingStateSelector,
})

export interface IInput {
  // no variables
}

export type IOutput = InputType<GraphQLTypes['Query'], typeof query>
