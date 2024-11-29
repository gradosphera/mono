import { describe, expect, it } from 'vitest'
import { createClient, type ValueTypes } from '../src'
import { getExtensions } from '../src/queries/extensions/getExtensions'
import { Gql, $ } from '../src/zeus'
import { installExtension } from '../src/mutations/extensions/installExtension'
import { Queries, Mutations, Selectors } from '../src'
import { ModelTypes } from '../dist'

describe('should', () => {
  it('exported', async () => {
    const client = createClient({
      baseUrl: 'http://127.0.0.1:2998/v1/graphql',
      headers: {
        'server-secret': 'SECRET'
        // `Authorization': 'Bearer ${token}`
      },
      blockchainUrl: 'http://127.0.0.1:8888',
      chainId: 'f50256680336ee6daaeee93915b945c1166b5dfc98977adcb717403ae225c559'
    })
    
    // Выполняем запрос напрямую через client, не используя selector
    const {getExtensions: extensions} = await client.Query(
      Queries.getExtensions,
      {
        variables: {
          data: {enabled: true}
        }
      }
    );
    
    console.log(extensions)

    const filter: ModelTypes['GetBranchesInput'] = {
      coopname: 'voskhod'
    }

    const {getBranches: branches} = await client.Query(
      Queries.getBranches,
      {
        variables: {
          data: filter
        }
      }
    );

    console.log(branches)
    
    
    const {getPaymentMethods: paymentMethods} = await client.Query(
      Queries.getPaymentMethods,
      // {
      //   variables: {
      //     data: filter
      //   }
      // }
    );

    console.log('paymentMethods: ', paymentMethods)
  })
})
