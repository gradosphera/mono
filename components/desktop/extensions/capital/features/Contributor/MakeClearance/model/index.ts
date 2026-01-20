import { ref } from 'vue';
import type { Mutations } from '@coopenomics/sdk';
import { api, type IMakeClearanceInput, type IMakeClearanceOutput, type IGenerateAppendixGenerationAgreementInput, type IGenerateAppendixGenerationAgreementOutput } from '../api';
import { useSignDocument } from 'src/shared/lib/document/model/entity';
import { useSessionStore } from 'src/entities/Session/model';
import type { Cooperative } from 'cooptypes';
import type { IGenerateDocumentInput, IGeneratedDocumentOutput } from 'src/shared/lib/types/document';

export type { IMakeClearanceInput, IMakeClearanceOutput };
export type { IGenerateAppendixGenerationAgreementInput, IGenerateAppendixGenerationAgreementOutput };
export type { IGenerateDocumentInput, IGeneratedDocumentOutput };

export type IGenerateAppendixAgreementInput =
  Mutations.Capital.GenerateAppendixGenerationAgreement.IInput['data'];

export function useMakeClearance() {
  const isLoading = ref(false);
  const { signDocument } = useSignDocument();
  const { username } = useSessionStore();

  const makeClearance = async (
    input: IMakeClearanceInput
  ): Promise<IMakeClearanceOutput> => {
    isLoading.value = true;
    try {
      console.log('input', input)
      const result = await api.makeClearance(input);
      return result;
    } finally {
      isLoading.value = false;
    }
  };

  const generateAppendixGenerationAgreement = async (
    input: IGenerateAppendixGenerationAgreementInput,
    options?: Parameters<typeof api.generateAppendixGenerationAgreement>[1]
  ): Promise<IGenerateAppendixGenerationAgreementOutput> => {
    isLoading.value = true;
    try {
      const result = await api.generateAppendixGenerationAgreement(input, options);
      return result;
    } finally {
      isLoading.value = false;
    }
  };

  const signGeneratedDocument = async (
    document: Cooperative.Document.ZGeneratedDocument
  ): Promise<Cooperative.Document.ISignedDocument2> => {
    // Подписываем документ одинарной подписью (signatureId = 1)
    const signedDocument = await signDocument(
      document,
      username,
      1, // signatureId = 1 для одинарной подписи
    );

    return signedDocument;
  };

  const respondToInvite = async (
    projectHash: string,
    coopname: string,
    contribution: string
  ): Promise<IMakeClearanceOutput> => {
    isLoading.value = true;
    try {
      // 1. Генерируем документ на бэкенде (передаем только project_hash)
      // Все данные извлекаются на бэкенде
      const generateInput: IGenerateAppendixAgreementInput = {
        coopname,
        username,
        project_hash: projectHash,
        lang: 'ru',
      };

      const generatedDocument = await generateAppendixGenerationAgreement(generateInput);

      // 2. Подписываем сгенерированный документ одинарной подписью
      const signedDocument = await signGeneratedDocument(generatedDocument);

      // 3. Отправляем подписанный документ
      const clearanceInput: IMakeClearanceInput = {
        project_hash: projectHash,
        coopname,
        username,
        document: signedDocument, // Подписанный документ
        contribution, // Текст вклада участника
      };
      return await makeClearance(clearanceInput);
    } finally {
      isLoading.value = false;
    }
  };

  return {
    makeClearance,
    generateAppendixGenerationAgreement,
    signGeneratedDocument,
    respondToInvite,
    isLoading,
  };
}
