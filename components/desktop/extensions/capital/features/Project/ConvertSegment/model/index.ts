import { ref, type Ref } from 'vue';
import type { Mutations } from '@coopenomics/sdk';
import { api } from '../api';

export type IConvertSegmentInput =
  Mutations.Capital.ConvertSegment.IInput['data'];

export function useConvertSegment() {
  const initialConvertSegmentInput: IConvertSegmentInput = {
    capital_amount: '',
    convert_hash: '',
    convert_statement: {
      doc_hash: '',
      hash: '',
      meta: {
        block_num: 0,
        coopname: '',
        created_at: '',
        generator: '',
        lang: '',
        links: [],
        registry_id: 0,
        timezone: '',
        title: '',
        username: '',
        version: '',
      },
      meta_hash: '',
      signatures: [],
      version: '',
    },
    coopname: '',
    project_amount: '',
    project_hash: '',
    username: '',
    wallet_amount: '',
  };

  const convertSegmentInput = ref<IConvertSegmentInput>({
    ...initialConvertSegmentInput,
  });

  // Универсальная функция для сброса объекта к начальному состоянию
  function resetInput(
    input: Ref<IConvertSegmentInput>,
    initial: IConvertSegmentInput,
  ) {
    Object.assign(input.value, initial);
  }

  async function convertSegment(data: IConvertSegmentInput) {
    const transaction = await api.convertSegment(data);

    // Сбрасываем convertSegmentInput после выполнения convertSegment
    resetInput(convertSegmentInput, initialConvertSegmentInput);

    return transaction;
  }

  return { convertSegment, convertSegmentInput };
}
