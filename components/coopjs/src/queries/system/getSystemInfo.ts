import { Selector } from "../../zeus";
import { systemInfoSelector } from "../../selectors/system/systemInfoSelector";

/**
 * Извлекает информацию о состоянии системы
 */
export const getSystemInfo = Selector("Query")({
  getSystemInfo: systemInfoSelector,
});
