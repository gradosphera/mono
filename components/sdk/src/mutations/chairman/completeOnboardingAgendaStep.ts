import { onboardingStateSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus'

export const name = 'completeChairmanAgendaStep'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'ChairmanOnboardingAgendaInput!') }, onboardingStateSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['ChairmanOnboardingAgendaInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
