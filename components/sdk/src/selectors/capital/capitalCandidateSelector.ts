import type { MakeAllFieldsRequired } from '../../utils/MakeAllFieldsRequired'
import { type ModelTypes, Selector, type ValueTypes } from '../../zeus/index'
import { rawCandidateSelector } from '../registration/candidateSelector'

export const rawCapitalCandidateSelector = {
  ...rawCandidateSelector,
  capital_status: true,
  rate_per_hour: true,
  hours_per_day: true,
  contributed_as_investor: true,
  contributed_as_creator: true,
  contributed_as_author: true,
  contributed_as_coordinator: true,
  contributed_as_contributor: true,
  contributed_as_propertor: true,
  level: true,
  about: true,
  contributor_hash: true,
  memo: true,
}

const _validate: MakeAllFieldsRequired<ValueTypes['CapitalCandidate']> = rawCapitalCandidateSelector

export type CapitalCandidateModel = ModelTypes['CapitalCandidate']
export const capitalCandidateSelector = Selector('CapitalCandidate')(rawCapitalCandidateSelector)
