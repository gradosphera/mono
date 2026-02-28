import { describe, expect, it } from 'vitest'
import { subscribedContracts, subsribedActions } from '../src/config'

describe('parser config', () => {
  it('has subscribed contracts defined', () => {
    expect(subscribedContracts).toBeDefined()
    expect(Array.isArray(subscribedContracts)).toBe(true)
    expect(subscribedContracts.length).toBeGreaterThan(0)
  })

  it('has subscribed actions for each contract', () => {
    expect(subsribedActions).toBeDefined()
    expect(subsribedActions.length).toBe(subscribedContracts.length)
    for (const action of subsribedActions) {
      expect(action.code).toBeDefined()
      expect(action.action).toBe('*')
    }
  })

  it('includes core contracts', () => {
    expect(subscribedContracts).toContain('registrator')
    expect(subscribedContracts).toContain('soviet')
    expect(subscribedContracts).toContain('draft')
    expect(subscribedContracts).toContain('eosio.token')
  })
})
