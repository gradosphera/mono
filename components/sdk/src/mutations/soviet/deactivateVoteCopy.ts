import { voteCopySettingSelector } from '../../selectors/soviet'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'deactivateVoteCopy'

export const mutation = Selector('Mutation')({
  [name]: [{ id: $('id', 'String!') }, voteCopySettingSelector],
})

export interface IInput {
  [key: string]: unknown
  id: string
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
