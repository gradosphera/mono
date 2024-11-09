import { describe, expect, it } from 'vitest'
import { createClient, type MakeAllFieldsRequired, type ValueTypes } from '../src'
import { getExtensionSelector } from '../src/selectors/get-extensions.selector'

describe('should', () => {
  it('exported', async () => {
    const client = createClient({
      baseUrl: 'http://127.0.0.1:2998/graphql',
      // headers: { 'Custom-Header': 'value' },
    })

    // Выполняем запрос с созданным селектором
    const { getExtensions: data } = await client.Query({ getExtensions: getExtensionSelector })

    console.log(data)
  })
})
