import { chairmanOnboardingStateSelector } from '../../selectors/chairman'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus'

export const name = 'completeChairmanGeneralMeetStep'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'ChairmanOnboardingGeneralMeetInput!') }, chairmanOnboardingStateSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['ChairmanOnboardingGeneralMeetInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
