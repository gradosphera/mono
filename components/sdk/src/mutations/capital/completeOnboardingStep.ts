import { capitalOnboardingStateSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus'

export const name = 'completeCapitalOnboardingStep'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'CapitalOnboardingStepInput!') }, capitalOnboardingStateSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['CapitalOnboardingStepInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
