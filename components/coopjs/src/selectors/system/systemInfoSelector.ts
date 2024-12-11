import type { MakeAllFieldsRequired } from "../../utils/MakeAllFieldsRequired";
import { Selector, type ValueTypes } from "../../zeus";
import { rawBlockchainInfoSelector } from "./blockchainInfoSelector";
import { rawCooperatorAccountSelector } from "./cooperatorAccountSelector";
import { rawSystemAccountSelector } from "./systemAccountSelector";

const rawSystemInfoSelector = {
  blockchain_info: rawBlockchainInfoSelector,
  cooperator_account: rawCooperatorAccountSelector,
  coopname: true,
  system_account: rawSystemAccountSelector,
  system_status: true,
};

const validateGetInfoSelector = (
  selector: typeof rawSystemInfoSelector,
): MakeAllFieldsRequired<ValueTypes["SystemInfo"]> => selector;
validateGetInfoSelector(rawSystemInfoSelector);

export const systemInfoSelector = Selector("SystemInfo")(rawSystemInfoSelector);
