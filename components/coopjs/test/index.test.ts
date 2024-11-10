import { describe, expect, it } from 'vitest'
import { createClient, type MakeAllFieldsRequired, type ValueTypes } from '../src'
import { getExtensions } from '../src/selectors/getExtensions'

describe('should', () => {
  it('exported', async () => {
    const client = createClient({
      baseUrl: 'http://127.0.0.1:2998/graphql',
    })

    // Выполняем запрос с созданным селектором
    const { getExtensions: data } = await client.Query({ getExtensions })

    console.log(data)
  })
})
