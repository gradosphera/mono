import { client } from 'src/shared/api/client';
import { Mutations } from '@coopenomics/sdk';
import { useSystemStore } from 'src/entities/System/model'

export type IGenerateSovietDecisionInput = Mutations.Meet.GenerateSovietDecisionOnAnnualMeetDocument.IInput['data'];
export type IGenerateSovietDecisionResult = Mutations.Meet.GenerateSovietDecisionOnAnnualMeetDocument.IOutput[typeof Mutations.Meet.GenerateSovietDecisionOnAnnualMeetDocument.name];

export async function generateSovietDecision(data: IGenerateSovietDecisionInput): Promise<IGenerateSovietDecisionResult> {
  const { [Mutations.Meet.GenerateSovietDecisionOnAnnualMeetDocument.name]: result } = await client.Mutation(
    Mutations.Meet.GenerateSovietDecisionOnAnnualMeetDocument.mutation,
    {
      variables: {
        data
      }
    }
  );

  return result;
}

export function useGenerateSovietDecisionOnAnnualMeet() {
  const { info } = useSystemStore()

  /**
   * Генерирует документ для решения о проведении общего собрания
   */
  async function generateSovietDecisionOnAnnualMeet(
    data: Omit<IGenerateSovietDecisionInput, 'coopname'>
  ): Promise<IGenerateSovietDecisionResult> {
    const { [Mutations.Meet.GenerateSovietDecisionOnAnnualMeetDocument.name]: result } = await client.Mutation(
      Mutations.Meet.GenerateSovietDecisionOnAnnualMeetDocument.mutation,
      {
        variables: {
          data: {
            coopname: info.coopname,
            ...data
          }
        }
      }
    )

    return result
  }

  return {
    generateSovietDecisionOnAnnualMeet
  }
}
