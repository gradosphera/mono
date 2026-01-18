import { chairmanOnboardingStateSelector } from '../../selectors/chairman'
import { type GraphQLTypes, type InputType, Selector } from '../../zeus'

export const name = 'getChairmanOnboardingState'

export const query = Selector('Query')({
  [name]: chairmanOnboardingStateSelector,
})

export interface IInput {
  // no variables
}

export type IOutput = InputType<GraphQLTypes['Query'], typeof query>
