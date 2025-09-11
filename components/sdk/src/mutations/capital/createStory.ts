import { rawStorySelector, rawTransactionSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'capitalCreateStory'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'CreateStoryInput!') }, rawStorySelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['CreateStoryInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
