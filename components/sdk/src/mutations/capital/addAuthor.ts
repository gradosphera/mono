import { rawProjectSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'capitalAddAuthor'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'AddAuthorInput!') }, rawProjectSelector],
})



export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['AddAuthorInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
