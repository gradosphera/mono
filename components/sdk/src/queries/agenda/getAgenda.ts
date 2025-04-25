import { agendaSelector } from '../../selectors/agenda/agendaSelector'
import { systemInfoSelector } from '../../selectors/system/systemInfoSelector'
import { type GraphQLTypes, type InputType, Selector } from '../../zeus/index'

export const name = 'getAgenda'

/**
 * Извлекает информацию о состоянии системы
 */
export const query = Selector('Query')({
  [name]: agendaSelector,
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown
}

export type IOutput = InputType<GraphQLTypes['Query'], typeof query>
