
/**
 * Создание объекта регистрационного платежа производится мутацией CreateInitial. 
 * Выполнение мутации возвращает идентификатор платежа и данные для его совершения в зависимости от выбранного платежного провайдера. 
 *  
```typescript 
  
  import { Mutations } from '@coopenomics/sdk'
  
  const variables: Mutations.Payments.CreateInitial.IInput = {
    data: {
      username: <имя пользователя>,
      provider: <идентификатор платежного провайдера>
    }
  
  const { [Mutations.Payments.CreateInitial.name]: result } = await client.Mutation(
    Mutations.Payments.CreateInitial.mutation,
    {
      variables,
    }
  );
```
 */
export * as CreateInitial from './createInitial'

/**
 * Создание объекта паевого платежа производится мутацией CreateDeposit. 
 * Выполнение мутации возвращает идентификатор платежа и данные для его совершения в зависимости от выбранного платежного провайдера. 
 *  
```typescript 
  
  import { Mutations } from '@coopenomics/sdk'
  
  const variables: Mutations.Payments.CreateDeposit.IInput = {
    data: {
      username: <имя пользователя>,
      provider: <идентификатор платежного провайдера>
    }
  
  const { [Mutations.Payments.CreateDeposit.name]: result } = await client.Mutation(
    Mutations.Payments.CreateDeposit.mutation,
    {
      variables,
    }
  );
```
 */
export * as CreateDeposit from './createDeposit'


/**
 * Изменение состояния платежа производится мутацией SetPaymentStatus.
 * Выполнение мутации изменяет статус платежа. 
 */
export * as SetPaymentStatus from './setPaymentStatus'