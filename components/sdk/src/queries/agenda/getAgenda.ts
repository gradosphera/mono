import { Selector, type GraphQLTypes, type InputType } from "../../zeus/index";
import { systemInfoSelector } from "../../selectors/system/systemInfoSelector";
import { agendaSelector } from "../../selectors/agenda/agendaSelector";

export const name = 'getAgenda'

/**
 * Извлекает информацию о состоянии системы
 */
export const query = Selector("Query")({
  [name]: agendaSelector,
});

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown;
}

export type IOutput = InputType<GraphQLTypes['Query'], typeof query>;
