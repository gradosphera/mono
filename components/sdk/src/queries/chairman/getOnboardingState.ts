import { onboardingStateSelector } from '../../selectors'
import { type GraphQLTypes, type InputType, Selector } from '../../zeus'

export const name = 'getChairmanOnboardingState'

export const query = Selector('Query')({
  [name]: onboardingStateSelector,
})

export interface IInput {
  // no variables
}

export type IOutput = InputType<GraphQLTypes['Query'], typeof query>
