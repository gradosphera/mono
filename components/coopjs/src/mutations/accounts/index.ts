/**
 * Обновление аккаунта пользователя производится по username. Мутация позволяет изменить приватные данные пользователя, а также, адрес электронной почты.
 *  Использовать мутацию может только председатель совета. 
 
```typescript
  
 import { Mutations } from '@coopenomics/sdk'
 
 const variables: Mutations.Accounts.UpdateAccount.IInput = {
    data: {
      username: string;
      email: string;
      entrepreneur_data?: null | <персональные данные ИП>;
      individual_data?: null | <персональные данные физлица>;
      organization_data?: null | <данные организации>
  }
  
  const { [Mutations.Accounts.UpdateAccount.name]: result } = await client.Mutation(
    Mutations.Accounts.UpdateAccount.mutation,
    {
      variables,
    }
  );
  
```

Обновление персональных данных в базе MONO производится добавлением нового объекта с указанием последнего необратимого блока в блокчейне, 
что позволяет использовать исторические данные для сверки и восстановления документов. Вся история изменений данных аккаунтов сохраняется. 

 */
export * as UpdateAccount from './updateAccount'

/**
 * Удалить аккаунт из базы данных провайдера мутацией DeleteAccount. Эта мутация используется, когда необходимо удалить объект пайщика для повторной регистрации. 
 * Удаление аккаунта производится только из базы данных провайдера. Удаление аккаунта не влияет на объекты пайщика в блокчейне. 
 *
 * Использовать мутацию может только председатель совета. 
 * ```typescript
  
 import { Mutations } from '@coopenomics/sdk'
 
 const variables: Mutations.Accounts.DeleteAccount.IInput = {
    data: {
      username_for_delete: string;
    }
  }
  
  const { [Mutations.Accounts.DeleteAccount.name]: result } = await client.Mutation(
    Mutations.Account.DeleteAccount.mutation,
    {
      variables,
    }
  );
  
```
 */
// export * as DeleteAccount from './deleteAccount'

/**
 * Регистрация аккаунта производится мутацией RegisterAccount, где в качестве переменных принимаются данные
 * пользователя одного из трех типов, определяемых в перечислении AccountType: Individual (физическое лицо), Organization (юридическое лицо) или Entrepreneur (индивидуальный предприниматель).
 * При указании типа пользователя Individual необходимо передать объект individual_data с данными физлица, при регистрации Organization - ожидается обязательная передача organization_data, 
 * при указании типа Entrepreneur - entrepreneur_data. 
 * 
 * Имя пользователя username и публичный ключ public_key генерируются вызовом метода generateAccount из SDK:

```typescript

import {generateAccount} from '@coopenomics/sdk'

const account = generateAccount()

```

В объекте account после генерации аккаунта содержится имя пользователя, приватный и публичный ключ. 
Сгенерированный приватный ключ из объекта аккаунта будет требоваться для входа в систему после регистрации. 
  
```typescript

console.log(account)
{
  name: "abcd1234wxyz",
  privateKey: "5JxyzABC1234567890defGHIJKLMNopqRSTUV",
  publicKey: "EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5SozEZ8i8jUBS6yX79y6"
}
  
```

Используя сгенерированный объект аккаунта с ключами, проводим регистрацию в системе учёта провайдера:

```typescript
  
 import { Mutations, AccountType, generateAccount } from '@coopenomics/sdk'
 
 const account = generateAccount()
  
 const variables: Mutations.Accounts.RegisterAccount.IInput = {
    data: {
      email: "<email пользователя>",
      type: <AccountType.Individual или AccountType.Organization или AccountType.Entrepreneur>,
      username: account.username,
      //передать один из объектов с данными пользователя
      individual_data: {<объект с данными физлица> },
      organization_data: {<объект с данными ИП> },
      entrepreneur_data: {<объект с данными организации> },
      public_key: account.publicKey
    }
  }
  
  const { [Mutations.Accounts.RegisterAccount.name]: result } = await client.Mutation(
    Mutations.Account.RegisterAccounts.mutation,
    {
      variables,
    }
  );
  
```
*/
export * as RegisterAccount from './registerAccount'



/**
 * Метод запуска процесса замены ключа. 
 * Замена ключа в блокчейне производится за подписью кооператива. Для того, чтобы произвести замену, пайщику необходим токен доступа, который будет отправлен ему на почту после вызова этой мутации.
 
```typescript
  
 import { Mutations } from '@coopenomics/sdk'
 
 const variables: Mutations.Accounts.StartResetKey.IInput = {
    data: {
      email: string;
  }
  
  const { [Mutations.Accounts.StartResetKey.name]: result } = await client.Mutation(
    Mutations.Accounts.StartResetKey.mutation,
    {
      variables,
    }
  );
  
```
*/
export * as StartResetKey from './startResetKey'


/**
 * Метод замены ключа. Вызывается пайщиком, для которого производится замена с передачей токена, 
 * который был отправлен ему на электронную почту после вызова мутации StartResetKey. 
 
```typescript
  
 import { Mutations } from '@coopenomics/sdk'
 
 const variables: Mutations.Accounts.ResetKey.IInput = {
    data: {
      public_key: <новый_публичный_ключ>,
      token: <токен_из_письма>,
  }
  
  const { [Mutations.Accounts.ResetKey.name]: result } = await client.Mutation(
    Mutations.Accounts.ResetKey.mutation,
    {
      variables,
    }
  );
  
```
Метод производит замену ключа в блокчейне на переданный. 
На текущий момент здесь не используется каких-либо дополнительных децентрализованных сценариев проверки. 
Считаем, что если кооператив меняет ключ пайщика - значит ему так надо, т.к. обычно сейчас один пайщик с одним аккаунтом является членом только одного кооператива. 

Однако, в дальнейшем, при введении функционала "карты пайщика", которая сделает допустимым "быстрый вход" для пайщиков одного кооператива - в другой, система замены ключа будет требовать подтверждения нескольких кооперативов.  
*/
export * as ResetKey from './resetKey'
