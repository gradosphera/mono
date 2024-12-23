import { $, Selector, type GraphQLTypes, type InputType, type ModelTypes } from "../../zeus";
import { extensionSelector } from "../../selectors/extensions/extensionSelector";

type inputModel = ModelTypes['GetExtensionsInput']

export const name = 'getExtensions'

/**
 * Извлекает расширения
 */
export const query = Selector("Query")({
  [name]: [{ data: $("data", "GetExtensionsInput") }, extensionSelector],
});

export interface IInput extends inputModel {}
export type IOutput = InputType<GraphQLTypes['Query'], typeof query>;
