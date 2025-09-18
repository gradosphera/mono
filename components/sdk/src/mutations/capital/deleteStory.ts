import { rawTransactionSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'capitalDeleteStory'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'DeleteCapitalStoryByHashInput!') }, true],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['DeleteCapitalStoryByHashInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
