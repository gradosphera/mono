import { client } from 'src/shared/api/client'
import { useSignDocument } from 'src/shared/lib/document/model/entity'
import { Mutations } from '@coopenomics/sdk'

export type ISignBySecretaryResult = Mutations.Meet.SignBySecretaryOnAnnualGeneralMeet.IOutput[typeof Mutations.Meet.SignBySecretaryOnAnnualGeneralMeet.name]
export type ISignByPresiderResult = Mutations.Meet.SignByPresiderOnAnnualGeneralMeet.IOutput[typeof Mutations.Meet.SignByPresiderOnAnnualGeneralMeet.name]

interface ICloseMeetWithDecisionInput {
  coopname: string
  hash: string
  username: string
}


export async function signBySecretaryOnAnnualGeneralMeetWithDecision(data: ICloseMeetWithDecisionInput): Promise<ISignBySecretaryResult> {
  const { signDocument } = useSignDocument()

  const variables: Mutations.Meet.GenerateAnnualGeneralMeetDecisionDocument.IInput = {
    data: {
      coopname: data.coopname,
      username: data.username,
    }
  }

  // Генерируем документ решения
  const { [Mutations.Meet.GenerateAnnualGeneralMeetDecisionDocument.name]: generatedDocument } = await client.Mutation(
    Mutations.Meet.GenerateAnnualGeneralMeetDecisionDocument.mutation,
    {
      variables
    }
  )

  // Подписываем документ
  const signedDocument = await signDocument(generatedDocument, data.username)

  const variables2: Mutations.Meet.SignBySecretaryOnAnnualGeneralMeet.IInput = {
    data: {
      coopname: data.coopname,
      hash: data.hash,
      username: data.username,
      secretary_decision: signedDocument
    }
  }
  // Закрываем собрание с подписанным решением секретаря
  const { [Mutations.Meet.SignBySecretaryOnAnnualGeneralMeet.name]: result } = await client.Mutation(
    Mutations.Meet.SignBySecretaryOnAnnualGeneralMeet.mutation,
    {
      variables: variables2
    }
  )

  return result
}

export async function signByPresiderOnAnnualGeneralMeetWithDecision(data: ICloseMeetWithDecisionInput): Promise<ISignByPresiderResult> {
  const { signDocument } = useSignDocument()

  const variables: Mutations.Meet.GenerateAnnualGeneralMeetDecisionDocument.IInput = {
    data: {
      coopname: data.coopname,
      username: data.username,
    }
  }
  // Генерируем документ решения
  const { [Mutations.Meet.GenerateAnnualGeneralMeetDecisionDocument.name]: generatedDocument } = await client.Mutation(
    Mutations.Meet.GenerateAnnualGeneralMeetDecisionDocument.mutation,
    {
      variables
    }
  )

  // Подписываем документ
  const signedDocument = await signDocument(generatedDocument, data.username)

  const variables2: Mutations.Meet.SignByPresiderOnAnnualGeneralMeet.IInput = {
    data: {
      coopname: data.coopname,
      hash: data.hash,
      username: data.username,
      presider_decision: signedDocument
    }
  }
  // Закрываем собрание с подписанным решением председателя
  const { [Mutations.Meet.SignByPresiderOnAnnualGeneralMeet.name]: result } = await client.Mutation(
    Mutations.Meet.SignByPresiderOnAnnualGeneralMeet.mutation,
    {
      variables: variables2
    }
  )

  return result
}
