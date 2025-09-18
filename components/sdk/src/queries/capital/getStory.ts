import { storySelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'capitalStory'

/**
 * Получение истории по HASH
 */
export const query = Selector('Query')({
  [name]: [{ data: $('data', 'GetCapitalStoryByHashInput!') }, storySelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['GetCapitalStoryByHashInput']
}

export type IOutput = InputType<GraphQLTypes['Query'], typeof query>
