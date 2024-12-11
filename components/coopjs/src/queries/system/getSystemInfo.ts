import type { ValueTypes } from "../../types";
import type { GraphQLTypes, ModelTypes } from "../../zeus";
import { $, InputType, Selector } from "../../zeus";
import { extensionSelector } from "../../selectors/extensions/extensionSelector";
import { branchSelector } from "../../selectors";
import { systemInfoSelector } from "../../selectors/system/systemInfoSelector";

/**
 * Извлекает информацию о состоянии системы
 */
export const getSystemInfo = Selector("Query")({
  getSystemInfo: systemInfoSelector,
});
