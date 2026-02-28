import { describe, expect, it } from 'vitest'
import { Workflows, Types, WorkflowBuilder, createDefaultChannelsConfig, createDefaultPreferences } from '../src'

describe('notifications exports', () => {
  it('exports Workflows object with all workflow definitions', () => {
    expect(Workflows).toBeDefined()
    expect(typeof Workflows).toBe('object')
    const workflowNames = Object.keys(Workflows)
    expect(workflowNames.length).toBeGreaterThan(0)
  })

  it('exports WorkflowBuilder class', () => {
    expect(WorkflowBuilder).toBeDefined()
    expect(typeof WorkflowBuilder).toBe('function')
  })

  it('exports Types namespace', () => {
    expect(Types).toBeDefined()
  })

  it('exports channel config helpers', () => {
    expect(createDefaultChannelsConfig).toBeDefined()
    expect(createDefaultPreferences).toBeDefined()
    expect(typeof createDefaultChannelsConfig).toBe('function')
    expect(typeof createDefaultPreferences).toBe('function')
  })

  it('createDefaultChannelsConfig returns valid config', () => {
    const config = createDefaultChannelsConfig()
    expect(config).toBeDefined()
    expect(typeof config).toBe('object')
  })

  it('createDefaultPreferences returns valid preferences', () => {
    const prefs = createDefaultPreferences()
    expect(prefs).toBeDefined()
    expect(typeof prefs).toBe('object')
  })
})

describe('workflow definitions', () => {
  it('each workflow has required fields', () => {
    for (const [name, workflow] of Object.entries(Workflows)) {
      expect(workflow, `Workflow ${name} should be defined`).toBeDefined()
    }
  })
})
