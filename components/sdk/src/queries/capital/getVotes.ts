import { votesPaginationSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'capitalVotes'

/**
 * Получение всех голосов с фильтрацией
 */
export const query = Selector('Query')({
  [name]: [{ filter: $('filter', 'VoteFilter'), options: $('options', 'PaginationInput') }, votesPaginationSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  filter?: ModelTypes['VoteFilter']
  options?: ModelTypes['PaginationInput']
}

export type IOutput = InputType<GraphQLTypes['Query'], typeof query>
