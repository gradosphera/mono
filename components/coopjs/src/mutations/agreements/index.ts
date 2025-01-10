/**
 * GeneratePrivacyAgreement - мутация для генерации соглашения политики конфиденциальности. 
 * 
 
```typescript
  
 import { Mutations } from '@coopenomics/sdk'
 
 const variables: Mutations.Agreements.GeneratePrivacyAgreement.IInput = {
    data: {
      username: <имя аккаунта пользователя>,
      coopname: <имя аккаунта кооператива>
  }
  
  const { [Mutations.Agreements.GeneratePrivacyAgreement.name]: privacyAgreement } = await client.Mutation(
    Mutations.Agreements.GeneratePrivacyAgreement.mutation,
    {
      variables,
    }
  );
  
```
*/
export * as GeneratePrivacyAgreement from './generatePrivacyAgreement'

/**
 * GenerateSignatureAgreement - мутация для генерации соглашения о цифровой подписи. 
 * 
 
```typescript
  
 import { Mutations } from '@coopenomics/sdk'
 
 const variables: Mutations.Agreements.GenerateSignatureAgreement.IInput = {
    data: {
      username: <имя аккаунта пользователя>,
      coopname: <имя аккаунта кооператива>
  }
  
  const { [Mutations.Agreements.GenerateSignatureAgreement.name]: signatureAgreement } = await client.Mutation(
    Mutations.Agreements.GenerateSignatureAgreement.mutation,
    {
      variables,
    }
  );
  
```
*/
export * as GenerateSignatureAgreement from './generateSignatureAgreement'

/**
 * Сгенерировать документ соглашения о целевой потребительской программе "Цифровой Кошелёк"
 */

/**
 * GenerateWalletAgreement - мутация для генерации о целевой потребительской программе "Цифровой Кошелёк".
 * 
 
```typescript
  
 import { Mutations } from '@coopenomics/sdk'
 
 const variables: Mutations.Agreements.GenerateWalletAgreement.IInput = {
    data: {
      username: <имя аккаунта пользователя>,
      coopname: <имя аккаунта кооператива>
  }
  
  const { [Mutations.Agreements.GenerateWalletAgreement.name]: walletAgreement } = await client.Mutation(
    Mutations.Agreements.GenerateWalletAgreement.mutation,
    {
      variables,
    }
  );
  
```
*/
export * as GenerateWalletAgreement from './generateWalletAgreement'

/**
 * Сгенерировать документ пользовательского соглашения
 */


/**
 * GenerateUserAgreement - мутация для генерации пользовательского соглашения.
 * 
 
```typescript
  
 import { Mutations } from '@coopenomics/sdk'
 
 const variables: Mutations.Agreements.GenerateUserAgreement.IInput = {
    data: {
      username: <имя аккаунта пользователя>,
      coopname: <имя аккаунта кооператива>
  }
  
  const { [Mutations.Agreements.GenerateUserAgreement.name]: userAgreement } = await client.Mutation(
    Mutations.Agreements.GenerateUserAgreement.mutation,
    {
      variables,
    }
  );
  
```
*/
export * as GenerateUserAgreement from './generateUserAgreement'