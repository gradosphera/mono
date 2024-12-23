import { $, Selector, type GraphQLTypes, type InputType, type ModelTypes } from "../../zeus";
import { systemInfoSelector } from "../../selectors/system/systemInfoSelector";
import { accountSelector, type accountModel } from "../../selectors/accounts";

type inputModel = ModelTypes['GetAccountInput']
export const name = 'getAccount'

/**
 * Извлекает комплексную информацию о аккаунте
 */
export const query = Selector("Query")({
  [name]: [{data: $('data', 'GetAccountInput!')}, accountSelector]
});

export interface IInput extends inputModel {}
export type IOutput = InputType<GraphQLTypes['Query'], typeof query>;
