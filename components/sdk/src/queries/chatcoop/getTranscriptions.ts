import { rawCallTranscriptionSelector } from '../../selectors/chatcoop/transcription'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'chatcoopGetTranscriptions'

export const query = Selector('Query')({
  [name]: [{ data: $('data', 'GetTranscriptionsInput') }, rawCallTranscriptionSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data?: ModelTypes['GetTranscriptionsInput']
}

export type IOutput = InputType<GraphQLTypes['Query'], typeof query>
