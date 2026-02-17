import type { MakeAllFieldsRequired } from '../../utils/MakeAllFieldsRequired';
import { type ModelTypes, Selector, type ValueTypes } from '../../zeus/index';

export const rawCandidateSelector = {
  username: true,
  username_display_name: true,
  coopname: true,
  braname: true,
  status: true,
  type: true,
  created_at: true,
  registered_at: true,
  referer: true,
  referer_display_name: true,
  public_key: true,
  program_key: true,
};

const _validate: MakeAllFieldsRequired<ValueTypes['Candidate']> = rawCandidateSelector;

export type CandidateModel = ModelTypes['Candidate'];
export const candidateSelector = Selector('Candidate')(rawCandidateSelector);
