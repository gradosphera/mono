import type { MakeAllFieldsRequired } from "../../utils/MakeAllFieldsRequired";
import { Selector, type ValueTypes } from "../../zeus";

export const rawParticipantAccountSelector = {
  braname: true,
  created_at: true,
  has_vote: true,
  is_initial: true,
  is_minimum: true,
  last_min_pay: true,
  last_update: true,
  status: true,
  type: true,
  username: true,
};

// Проверка валидности
const _validate: MakeAllFieldsRequired<ValueTypes["ParticipantAccount"]> = rawParticipantAccountSelector;

export const participantAccountSelector = Selector("ParticipantAccount")(
  rawParticipantAccountSelector,
);

