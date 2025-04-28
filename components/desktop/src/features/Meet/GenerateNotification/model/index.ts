import { client } from 'src/shared/api/client'
import { Mutations } from '@coopenomics/sdk'

export type IGenerateNotificationInput = Mutations.Meet.GenerateAnnualGeneralMeetNotificationDocument.IInput['data']
export type IGenerateNotificationResult = Mutations.Meet.GenerateAnnualGeneralMeetNotificationDocument.IOutput[typeof Mutations.Meet.GenerateAnnualGeneralMeetNotificationDocument.name]

export async function generateNotification(data: IGenerateNotificationInput): Promise<IGenerateNotificationResult> {
  const { [Mutations.Meet.GenerateAnnualGeneralMeetNotificationDocument.name]: result } = await client.Mutation(
    Mutations.Meet.GenerateAnnualGeneralMeetNotificationDocument.mutation,
    {
      variables: {
        data
      }
    }
  )

  return result
} 