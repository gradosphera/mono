import { Selector, type GraphQLTypes, type InputType } from "../../zeus";
import { systemInfoSelector } from "../../selectors/system/systemInfoSelector";

export const name = 'getSystemInfo'

/**
 * Извлекает информацию о состоянии системы
 */
export const query = Selector("Query")({
  [name]: systemInfoSelector,
});


export type IOutput = InputType<GraphQLTypes['Query'], typeof query>;
