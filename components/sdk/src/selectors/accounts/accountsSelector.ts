import type { MakeAllFieldsRequired } from "../../utils/MakeAllFieldsRequired";
import { paginationSelector } from "../../utils/paginationSelector";
import { Selector, type ModelTypes, type ValueTypes } from "../../zeus";
import { rawBlockchainAccountSelector } from "../common/blockchainAccountSelector";
import { rawAccountSelector } from "./accountSelector";
import { rawMonoAccountSelector } from "./monoAccountSelector";
import { rawParticipantAccountSelector } from "./participantAccountSelector";
import { rawUserAccountSelector } from "./userAccountSelector";

const rawAccountsPaginationSelector = {...paginationSelector, items: rawAccountSelector};

// Проверка валидности
const _validate: MakeAllFieldsRequired<ValueTypes['AccountsPaginationResult']> = rawAccountsPaginationSelector;
export type accountModel = ModelTypes['AccountsPaginationResult']
export const accountsPaginationSelector = Selector("AccountsPaginationResult")(rawAccountsPaginationSelector);
