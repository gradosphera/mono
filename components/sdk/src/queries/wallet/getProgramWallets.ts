import { programWalletsPaginationSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'getProgramWallets'

/**
 * Получение списка программных кошельков с фильтрацией и пагинацией
 */
export const query = Selector('Query')({
  [name]: [
    {
      filter: $('filter', 'ProgramWalletFilterInput'),
      options: $('options', 'PaginationInput'),
    },
    programWalletsPaginationSelector,
  ],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  filter?: ModelTypes['ProgramWalletFilterInput']
  options?: ModelTypes['PaginationInput']
}

export type IOutput = InputType<GraphQLTypes['Query'], typeof query>