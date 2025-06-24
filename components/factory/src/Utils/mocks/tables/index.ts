import { matchMock } from '../matchMock'
import { meetTableMock } from './meet'

meetTableMock.match = function (url: string, params?: URLSearchParams) {
  return matchMock(this, url, params)
}

export const tablesMocks = [meetTableMock as any]
