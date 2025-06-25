import { matchMock } from '../matchMock'
import { voteforActionMock } from './votefor'
import { returnByMoneyDecisionActionMock, voteAgainstDecision9001Mock, voteForDecision9001Mock } from './returnByMoneyDecision'

voteforActionMock.match = function (url: string, params?: URLSearchParams): boolean {
  return matchMock(this, url, params)
}

returnByMoneyDecisionActionMock.match = function (url: string, params?: URLSearchParams): boolean {
  return matchMock(this, url, params)
}

voteForDecision9001Mock.match = function (url: string, params?: URLSearchParams): boolean {
  return matchMock(this, url, params)
}

voteAgainstDecision9001Mock.match = function (url: string, params?: URLSearchParams): boolean {
  return matchMock(this, url, params)
}

export const actionsMocks = [
  voteforActionMock as any,
  returnByMoneyDecisionActionMock as any,
  voteForDecision9001Mock as any,
  voteAgainstDecision9001Mock as any,
]
