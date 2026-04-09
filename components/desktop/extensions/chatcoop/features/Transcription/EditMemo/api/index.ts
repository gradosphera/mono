import { client } from 'src/shared/api/client';
import { Mutations } from '@coopenomics/sdk';
import type { ITranscription } from '../../../../entities/Transcription/model/types';

export async function updateTranscriptionMemo(params: { id: string; memo: string }): Promise<ITranscription> {
  const name = Mutations.ChatCoop.UpdateTranscriptionMemo.name;
  const { [name]: row } = await client.Mutation(Mutations.ChatCoop.UpdateTranscriptionMemo.mutation, {
    variables: { data: params },
  });
  if (!row) {
    throw new Error('Empty transcription memo update response');
  }
  return row;
}
