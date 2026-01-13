import { projectSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'capitalFinalizeProject'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'FinalizeProjectInput!') }, projectSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['FinalizeProjectInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>