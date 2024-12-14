import type { MakeAllFieldsRequired } from "../../utils/MakeAllFieldsRequired";
import { Selector, type ValueTypes } from "../../zeus";
import { rawBlockchainAccountSelector } from "../common/blockchainAccountSelector";
import { rawMonoAccountSelector } from "./monoAccountSelector";
import { rawParticipantAccountSelector } from "./participantAccountSelector";
import { rawUserAccountSelector } from "./userAccountSelector";

const rawAccountSelector = {
  username: true,
  blockchain_account: rawBlockchainAccountSelector,
  mono_account: rawMonoAccountSelector,
  participant_account: rawParticipantAccountSelector,
  user_account: rawUserAccountSelector,  
};

const validate = (
  selector: typeof rawAccountSelector,
): MakeAllFieldsRequired<ValueTypes["Account"]> => selector;
validate(rawAccountSelector);

export const accountSelector = Selector("Account")(rawAccountSelector);