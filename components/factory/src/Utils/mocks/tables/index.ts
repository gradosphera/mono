import { matchMock } from '../matchMock'
import { meetQuestionsMock, meetTableMock } from './meet'

meetTableMock.match = function (url: string, params?: URLSearchParams) {
  return matchMock(this, url, params)
}

meetQuestionsMock.match = function (url: string, params?: URLSearchParams) {
  return matchMock(this, url, params)
}

export const tablesMocks = [meetTableMock as any, meetQuestionsMock as any]
