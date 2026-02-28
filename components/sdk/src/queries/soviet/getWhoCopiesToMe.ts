import { voteCopySettingSelector } from '../../selectors/soviet'
import { type GraphQLTypes, type InputType, Selector } from '../../zeus/index'

export const name = 'getWhoCopiesToMe'

export const query = Selector('Query')({
  [name]: voteCopySettingSelector,
})

export interface IInput {
  [key: string]: unknown
}

export type IOutput = InputType<GraphQLTypes['Query'], typeof query>
