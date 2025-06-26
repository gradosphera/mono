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
/** Добавить активного пайщика, который вступил в кооператив, не используя платформу (заполнив заявление собственноручно, оплатив вступительный и минимальный паевый взносы, и получив протокол решения совета) */
export * as AddParticipant from './addParticipant'

/** Сгенерировать документ заявления о вступлении в кооператив. */
export * as GenerateParticipantApplication from './generateParticipantApplication'

/** Сгенерировать документ протокол решения собрания совета */
export * as GenerateParticipantApplicationDecision from './generateParticipantApplicationDecision'

/** Зарегистрировать заявление и подписанные положения, подготовив пакет документов к отправке в совет на голосование после поступления оплаты. */
export * as RegisterParticipant from './registerParticipant'

/** Создание объекта регистрационного платежа производится мутацией createInitialPayment. Выполнение мутации возвращает идентификатор платежа и данные для его совершения в зависимости от выбранного платежного провайдера. */
export * as CreateInitialPayment from './createInitialPayment'
