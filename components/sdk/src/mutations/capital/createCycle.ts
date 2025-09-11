import { rawCycleSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'capitalCreateCycle'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'CreateCycleInput!') }, rawCycleSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['CreateCycleInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
