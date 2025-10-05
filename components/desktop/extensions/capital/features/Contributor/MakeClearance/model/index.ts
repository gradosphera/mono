import { ref } from 'vue';
import { api, type IMakeClearanceInput, type IMakeClearanceOutput } from '../api';
import { useSignDocument } from 'src/shared/lib/document/model/entity';
import { useSessionStore } from 'src/entities/Session/model';
import type { Cooperative } from 'cooptypes';
import type { IGenerateDocumentInput, IGeneratedDocumentOutput } from 'src/shared/lib/types/document';

export type { IMakeClearanceInput, IMakeClearanceOutput };
export type { IGenerateDocumentInput, IGeneratedDocumentOutput };

export function useMakeClearance() {
  const isLoading = ref(false);
  const { signDocument } = useSignDocument();
  const { username } = useSessionStore();

  const makeClearance = async (
    input: IMakeClearanceInput
  ): Promise<IMakeClearanceOutput> => {
    isLoading.value = true;
    try {
      const result = await api.makeClearance(input);
      return result;
    } finally {
      isLoading.value = false;
    }
  };

  const generateAppendixGenerationAgreement = async (
    input: IGenerateDocumentInput,
    options?: Parameters<typeof api.generateAppendixGenerationAgreement>[1]
  ): Promise<IGeneratedDocumentOutput> => {
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
      // 1. Генерируем приложение к генерационному соглашению
      const generateInput: IGenerateDocumentInput = {
        coopname,
        username,
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
      console.log('clearanceInput:', clearanceInput)
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
