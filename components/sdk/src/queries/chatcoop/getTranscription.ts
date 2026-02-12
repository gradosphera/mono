import { rawCallTranscriptionWithSegmentsSelector } from '../../selectors/chatcoop/transcription'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'chatcoopGetTranscription'

export const query = Selector('Query')({
  [name]: [{ data: $('data', 'GetTranscriptionInput!') }, rawCallTranscriptionWithSegmentsSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['GetTranscriptionInput']
}

export type IOutput = InputType<GraphQLTypes['Query'], typeof query>
