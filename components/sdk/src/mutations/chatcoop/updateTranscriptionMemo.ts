import { rawCallTranscriptionSelector } from '../../selectors/chatcoop/transcription'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'chatcoopUpdateTranscriptionMemo'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'UpdateCallTranscriptionMemoInput!') }, rawCallTranscriptionSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['UpdateCallTranscriptionMemoInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
