import { matchMock } from '../matchMock'
import { voteforActionMock } from './votefor'

voteforActionMock.match = function (url: string, params?: URLSearchParams): boolean {
  return matchMock(this, url, params)
}

export const actionsMocks = [voteforActionMock as any]
