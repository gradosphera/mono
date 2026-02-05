import { programWalletSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'getProgramWallet'

/**
 * Получение одного программного кошелька по фильтру
 */
export const query = Selector('Query')({
  [name]: [
    {
      filter: $('filter', 'ProgramWalletFilterInput!'),
    },
    programWalletSelector,
  ],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  filter: ModelTypes['ProgramWalletFilterInput']
  options: ModelTypes['PaginationInput']
}

export type IOutput = InputType<GraphQLTypes['Query'], typeof query>
