import { ref } from 'vue';
import { api, type ICompleteCapitalRegistrationInput, type ICompleteCapitalRegistrationOutput } from '../api';
import { useContributorStore } from 'app/extensions/capital/entities/Contributor/model';
import { useSystemStore } from 'src/entities/System/model';
import { useSessionStore } from 'src/entities/Session';
import { DigitalDocument } from 'src/shared/lib/document';
import type { IGeneratedDocumentOutput } from 'src/shared/lib/types/document';

export function useCompleteCapitalRegistration() {
  const store = useContributorStore();
  const system = useSystemStore();
  const session = useSessionStore();

  // Состояния
  const isCompleting = ref(false);

  /**
   * Завершение регистрации в Capital с подписанием и отправкой документов
   */
  async function completeRegistration(
    generationContract: IGeneratedDocumentOutput | undefined,
    storageAgreement: IGeneratedDocumentOutput,
    blagorostAgreement?: IGeneratedDocumentOutput,
    generatorOffer?: IGeneratedDocumentOutput,
    registrationData?: {
      about?: string;
      rate_per_hour?: string;
      hours_per_day?: number;
    }
  ): Promise<ICompleteCapitalRegistrationOutput> {
    isCompleting.value = true;
    try {
      // Подписываем документы (generation_contract может быть undefined для импортированных участников)
      const signedGenerationContract = generationContract
        ? await new DigitalDocument(generationContract).sign(session.username)
        : undefined;
      const signedStorageAgreement = await new DigitalDocument(storageAgreement).sign(session.username);
      const signedBlagorostAgreement = blagorostAgreement
        ? await new DigitalDocument(blagorostAgreement).sign(session.username)
        : undefined;
      const signedGeneratorOffer = generatorOffer
        ? await new DigitalDocument(generatorOffer).sign(session.username)
        : undefined;

      // Формируем данные для отправки
      const data: ICompleteCapitalRegistrationInput = {
        coopname: system.info.coopname,
        username: session.username,
        generation_contract: signedGenerationContract,
        storage_agreement: signedStorageAgreement,
        blagorost_agreement: signedBlagorostAgreement,
        generator_offer: signedGeneratorOffer,
        about: registrationData?.about,
        rate_per_hour: registrationData?.rate_per_hour,
        hours_per_day: registrationData?.hours_per_day,
      };

      // Отправляем в блокчейн
      const result = await api.completeCapitalRegistration(data);

      // Обновляем информацию о текущем пользователе
      await store.loadSelf({
        username: session.username,
      });

      return result;
    } finally {
      isCompleting.value = false;
    }
  }

  return {
    completeRegistration,
    isCompleting,
  };
}
