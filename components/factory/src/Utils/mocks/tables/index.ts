import { matchMock } from '../matchMock'
import { meetQuestionsMock, meetTableMock } from './meet'
import { draftTableMock, draftTranslationsMock } from './draft'
import { cooperativeTableMock } from './cooperative'

meetTableMock.match = function (url: string, params?: URLSearchParams) {
  return matchMock(this, url, params)
}

meetQuestionsMock.match = function (url: string, params?: URLSearchParams) {
  return matchMock(this, url, params)
}

export const tablesMocks = [
  draftTableMock as any,
  draftTranslationsMock as any,
  cooperativeTableMock as any,
  meetTableMock as any,
  meetQuestionsMock as any,
]
