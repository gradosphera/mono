/**
 * Мутация для генерации заявления на вступление пайщика в кооператив вызывается с параметром signature, 
 * который может быть пустым для пред-генерации, или содержать png изображение подписи в кодировке base64 для основной генерации. 
 * Массив links будет пустым для пред-генерации, но обязательно должен содержать хэши 4-х соглашений для основной генерации. 
 * 
 
```typescript
  
 import { Mutations } from '@coopenomics/sdk'
 
 const variables: Mutations.Participants.GenerateApplication.IInput = {
    data: {
      singature: '' | <строка с изображением подписи png/base64>,
      links: [] | [<массив хэшей соглашений>]
      username: <имя аккаунта пользователя>,
      coopname: <имя аккаунта кооператива>
  }
  
  const { [Mutations.Participants.GenerateApplication.name]: participantApplication } = await client.Mutation(
    Mutations.Participants.GenerateApplication.mutation,
    {
      variables,
    }
  );
  
```
*/
export * as GenerateApplication from './generateParticipantApplication'

/**
 * Сгенерировать протокол решения совета о приёме пайщика в кооператив
 */
export * as GenerateDecision from './generateParticipantApplicationDecision'

/**
 * Регистрация пайщика производится мутацией RegisterParticipant с передачей подписанного заявления и соглашений. 
 * Отправленный пакет документов сохраняется в MONO для пользователя и ожидает поступления оплаты взносов перед отправкой в совет на голосование.
 * 
 
```typescript 
  
  import { Mutations } from '@coopenomics/sdk'
  
  const variables: Mutations.Participants.RegisterParticipant.IInput = {
    data: {
      username: <имя пользователя>,
      statement: signedParticipantApplication, //подписанное заявление
      //подписанные соглашения
      privacy_agreement: signedPrivacyAgreement, 
      signature_agreement: signedSignatureAgreement,      
      user_agreement: signedUserAgreement,
      wallet_agreement: signedWalletAgreement,
    }
  
  const { [Mutations.Participants.RegisterParticipant.name]: result } = await client.Mutation(
    Mutations.Participants.RegisterParticipant.mutation,
    {
      variables,
    }
  );
```
 */
export * as RegisterParticipant from './registerParticipant'

/**

```typescript
  import { Mutations, Zeus} from '@coopenomics/sdk'
  
  const variables: Mutations.Participants.AddParticipant.IInput = {
      data: {
        created_at: "<фактическая дата регистрации пайщика>",
        email: "<email пайщика>",
        initial: <внесенный вступительного взнос (100.0000 RUB)>,
        minimum: <внесенный мин. паевый взнос (300.0000 RUB)>,
        
        //флаг распределения вступительного взноса по фондам указывает то, 
        // следует ли системе добавить вступительный взнос в фонд для дальнейшего списания (true), 
        // или он был ранее добавлен и списан на хозяйственные расходы (false).
        spread_initial: false | true, 
        //тип добавляемого аккаунта - физлицо, юрлицо или организация
        type: <Zeus.AccountType.Individual | Zeus.AccountType.Entrepreneur | Zeus.AccountType.Organization>
        
        //передать один из объектов с данными      
        individual_data: {<объект с данными физлица> },
        organization_data: {<объект с данными ИП> },
        entrepreneur_data: {<объект с данными организации> },  
      }
    }
    
  const { [Mutations.Account.AddParticipant.name]: result } = await client.Mutation(
    Mutations.Account.AddParticipant.mutation,
    {
      variables,
    }
  );
```
 */
export * as AddParticipant from './addParticipant'