import { describe, expect, it } from 'vitest'
import { Client, Queries } from '../src'

const CHAIN_ID = process.env.CHAIN_ID || ''
const API_URL = process.env.API_URL || ''
const CHAIN_URL = process.env.CHAIN_URL || ''

describe('SDK integration tests', () => {
  const client = Client.create({
    api_url: API_URL,
    headers: {
      'server-secret': process.env.SERVER_SECRET || 'SECRET',
    },
    chain_url: CHAIN_URL,
    chain_id: CHAIN_ID,
  })

  it('should login', async () => {
    await client.login(
      process.env.TEST_EMAIL || 'ivanov@example.com',
      process.env.TEST_WIF || '5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3',
    )
  })

  it('should fetch extensions', async () => {
    const { [Queries.Extensions.GetExtensions.name]: extensions }: Queries.Extensions.GetExtensions.IOutput = await client.Query(
      Queries.Extensions.GetExtensions.query,
      {
        variables: {
          data: { enabled: true },
        },
      },
    )
    expect(extensions).toBeDefined()
    expect(Array.isArray(extensions)).toBe(true)
  })

  it('should fetch branches', async () => {
    const filter: Queries.Branches.GetBranches.IInput = {
      data: {
        coopname: 'voskhod',
      },
    }

    const { [Queries.Branches.GetBranches.name]: branches } = await client.Query(Queries.Branches.GetBranches.query, {
      variables: filter,
    })
    expect(branches).toBeDefined()
    expect(Array.isArray(branches)).toBe(true)
  })

  it('should fetch system info', async () => {
    const { [Queries.System.GetSystemInfo.name]: systemInfo } = await client.Query(
      Queries.System.GetSystemInfo.query,
    )
    expect(systemInfo).toBeDefined()
    expect(systemInfo.blockchain_info).toBeDefined()
    expect(systemInfo.cooperator_account).toHaveProperty('username', 'voskhod')
    expect(systemInfo.system_status).toBe('active')
  })
})
