import { client } from 'src/shared/api/client';
import { Queries } from '@coopenomics/sdk';
import type { IGetTranscriptionsOutput, IGetTranscriptionOutput } from '../model/types';

interface IGetTranscriptionsParams {
  limit?: number;
  offset?: number;
  matrixRoomId?: string;
}

async function getTranscriptions(params: IGetTranscriptionsParams = {}): Promise<IGetTranscriptionsOutput> {
  const { [Queries.ChatCoop.GetTranscriptions.name]: output } = await client.Query(
    Queries.ChatCoop.GetTranscriptions.query,
    {
      variables: {
        limit: params.limit,
        offset: params.offset,
        matrixRoomId: params.matrixRoomId,
      },
    },
  );

  return output;
}

async function getTranscription(id: string): Promise<IGetTranscriptionOutput> {
  const { [Queries.ChatCoop.GetTranscription.name]: output } = await client.Query(
    Queries.ChatCoop.GetTranscription.query,
    {
      variables: { id },
    },
  );

  return output;
}

export const api = {
  getTranscriptions,
  getTranscription,
};
