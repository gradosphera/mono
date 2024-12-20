import { $, Selector } from "../../zeus";
import { systemInfoSelector } from "../../selectors/system/systemInfoSelector";
import { accountSelector } from "../../selectors/accounts";

/**
 * Извлекает комплексную информацию о аккаунте
 */
export const getAccount = Selector("Query")({
  getAccount: [{data: $('data', 'GetAccountInput!')}, accountSelector]
});
