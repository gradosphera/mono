import type { MakeAllFieldsRequired } from "../../utils/MakeAllFieldsRequired";
import { Selector, type ValueTypes } from "../../zeus";
import { rawBlockchainInfoSelector } from "./blockchainInfoSelector";
import { rawCooperatorAccountSelector } from "./cooperatorAccountSelector";
import { rawBlockchainAccountSelector } from "../common/blockchainAccountSelector";

const rawSystemInfoSelector = {
  blockchain_info: rawBlockchainInfoSelector,
  cooperator_account: rawCooperatorAccountSelector,
  coopname: true,
  blockchain_account: rawBlockchainAccountSelector,
  system_status: true,
};

const validateGetInfoSelector = (
  selector: typeof rawSystemInfoSelector,
): MakeAllFieldsRequired<ValueTypes["SystemInfo"]> => selector;
validateGetInfoSelector(rawSystemInfoSelector);

export const systemInfoSelector = Selector("SystemInfo")(rawSystemInfoSelector);
