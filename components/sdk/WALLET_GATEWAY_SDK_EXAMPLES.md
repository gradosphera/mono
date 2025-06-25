# Примеры использования SDK для Wallet и Gateway модулей

## Wallet Module

### Создание заявки на вывод средств
```typescript
import { Client } from '@cooptypes/sdk'
import * as Mutations from '@cooptypes/sdk/mutations'

const client = Client.getInstance()

const result = await client.Mutation(
  Mutations.Wallet.CreateWithdraw.mutation,
  {
    variables: {
      input: {
        coopname: 'mycoopname',
        username: 'alice',
        quantity: '100.0000',
        symbol: 'SHARES',
        method_id: 'card_123',
        memo: 'Возврат паевого взноса',
        statement: {
          hash: 'doc_hash_here',
          signatures: [
            {
              signature: 'SIG_...',
              public_key: 'EOS...',
              // ... другие поля подписи
            }
          ],
          rawDocument: {
            hash: 'raw_doc_hash',
            binary: 'base64_content',
            full_title: 'Заявление на возврат',
            html: '<html>...</html>',
            meta: {}
          }
        }
      }
    }
  }
)

console.log('Withdraw hash:', result.createWithdraw.withdraw_hash)
```

### Генерация документа заявления (900)
```typescript
import * as Mutations from '@cooptypes/sdk/mutations'

const result = await client.Mutation(
  Mutations.Wallet.GenerateReturnByMoneyStatementDocument.mutation,
  {
    variables: {
      data: {
        coopname: 'mycoopname',
        username: 'alice',
        full_name: 'Алиса Иванова',
        quantity: '100.0000',
        symbol: 'SHARES'
      },
      options: {
        format: 'pdf'
      }
    }
  }
)

console.log('Generated document:', result.generateReturnByMoneyStatementDocument)
```

### Генерация документа решения (901)
```typescript
import * as Mutations from '@cooptypes/sdk/mutations'

const result = await client.Mutation(
  Mutations.Wallet.GenerateReturnByMoneyDecisionDocument.mutation,
  {
    variables: {
      data: {
        coopname: 'mycoopname',
        username: 'alice',
        full_name: 'Алиса Иванова',
        quantity: '100.0000',
        symbol: 'SHARES',
        decision_date: new Date(),
        decision_number: 'Р-001'
      }
    }
  }
)

console.log('Generated decision:', result.generateReturnByMoneyDecisionDocument)
```

## Gateway Module

### Получение списка платежей
```typescript
import * as Queries from '@cooptypes/sdk/queries'

const result = await client.Query(
  Queries.Gateway.GetGatewayPayments.query,
  {
    variables: {
      filters: {
        coopname: 'mycoopname',
        username: 'alice',
        status: 'pending'
      },
      options: {
        limit: 20,
        offset: 0
      }
    }
  }
)

console.log('Payments:', result.getGatewayPayments.items)
console.log('Total count:', result.getGatewayPayments.totalCount)
```

### Обновление статуса платежа
```typescript
import * as Mutations from '@cooptypes/sdk/mutations'

const result = await client.Mutation(
  Mutations.Gateway.UpdatePaymentStatus.mutation,
  {
    variables: {
      input: {
        hash: 'payment_hash_here',
        coopname: 'mycoopname',
        type: 'outgoing',
        status: 'completed'
      }
    }
  }
)

console.log('Updated payment:', result.updatePaymentStatus)
```

## Типизация

Все селекторы поставляются с типами:

```typescript
import type { 
  CreateWithdrawResponseType,
  PaymentType,
  OutgoingPaymentType,
  PaginatedPaymentsType 
} from '@cooptypes/sdk/selectors'

// Строгая типизация результатов
const payment: PaymentType = {
  id: '123',
  coopname: 'mycoopname',
  username: 'alice',
  hash: 'payment_hash',
  quantity: '100.0000',
  symbol: 'SHARES',
  status: 'pending',
  type: 'outgoing',
  // ... остальные поля с проверкой типов
}
```
