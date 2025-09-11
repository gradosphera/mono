import { contributorSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'capitalContributor'

/**
 * Получение вкладчика по ID
 */
export const query = Selector('Query')({
  [name]: [{ data: $('data', 'GetContributorInput!') }, contributorSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['GetContributorInput']
}

export type IOutput = InputType<GraphQLTypes['Query'], typeof query>
