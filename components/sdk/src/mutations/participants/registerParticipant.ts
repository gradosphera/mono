import { accountSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'registerParticipant'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'RegisterParticipantInput!') }, accountSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['RegisterParticipantInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
