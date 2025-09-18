import { rawStorySelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'capitalUpdateStory'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'UpdateStoryInput!') }, rawStorySelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['UpdateStoryInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
