import { voteCopySettingSelector } from '../../selectors/soviet'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'createVoteCopy'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'CreateVoteCopyInput!') }, voteCopySettingSelector],
})

export interface IInput {
  [key: string]: unknown
  data: ModelTypes['CreateVoteCopyInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
