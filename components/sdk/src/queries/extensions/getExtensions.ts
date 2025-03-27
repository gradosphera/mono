import { $, Selector, type GraphQLTypes, type InputType, type ModelTypes } from "../../zeus/index";
import { extensionSelector } from "../../selectors/extensions/extensionSelector";

export const name = 'getExtensions'

/**
 * Извлекает расширения
 */
export const query = Selector("Query")({
  [name]: [{ data: $("data", "GetExtensionsInput") }, extensionSelector],
});

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown;

  data: ModelTypes['GetExtensionsInput'],
}

export type IOutput = InputType<GraphQLTypes['Query'], typeof query>;
