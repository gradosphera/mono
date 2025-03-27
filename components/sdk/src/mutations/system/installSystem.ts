import { systemInfoSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'installSystem'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'Install!') }, systemInfoSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['Install']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
