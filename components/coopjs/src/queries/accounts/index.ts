/**
Запрос извлечения объекта аккаунта по username. 
Может быть выполнен председателем или членом совета на любой аккаунт, 
или пользователем, с собственным username. Если запрос совершает пользователь, 
то он должен предоставить свой username, который совпадёт с тем именем аккаунта, 
которое будет извлечено из JWT на бэкенде. 

```typescript
  
 import { Queries } from '@coopenomics/sdk'
 
 const variables: Queries.Accounts.GetAccount.IInput = {
    data: {
      username: string;
  }
  
  const { [Queries.Account.UpdateAccount.name]: result } = await client.Query(
    Queries.Account.UpdateAccount.query,
    {
      variables,
    }
  );
  
```
*/

export * as GetAccount from './getAccount'

/**
Запрос извлечения листа аккаунтов с постраничным просмотром результатов.  

```typescript
  
 import { Queries } from '@coopenomics/sdk'
 
 const variables: Queries.Accounts.GetAccounts.IInput = {
    data: {
      role: 'user';
    }, 
    options: {
      limit: 10
    }
  }
      
  
  
  const { [Queries.Account.GetAccounts.name]: result } = await client.Queries(
    Queries.Account.GetAccounts.query,
    {
      variables,
    }
  );
  
```

Результат будет представлен в виде объекта с массивом items, где каждый элемент массива - это составной объект аккаунта.

*/
export * as GetAccounts from './getAccounts'