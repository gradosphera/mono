<template lang="pug">
// Лоадер при начальной загрузке
Loader(v-if='isInitialLoading', text='Генерация договора участия...')

q-card(v-else, flat bordered)
  .q-pa-lg
    // Регистрация договора участия
    template(v-if='!isContracted')
      .text-h6.q-mb-md Регистрация договора участия
      .text-body2.q-mb-lg
        | Для участия в системе капитализации необходимо подписать договор участия.
        br
        | Договор определяет ваши права и обязанности как участника кооператива.

      // Загрузка документа
      template(v-if='isGenerating')
        .q-mb-md
          .text-center
            q-spinner(color='primary' size='3em')
            .q-mt-md.text-body2 Генерация договора...

      // Показ документа для подписания
      template(v-else-if='generatedDocument')
        .q-mb-md
          .text-subtitle1.q-mb-sm Ознакомьтесь с договором участия:
          .q-pa-md.border.rounded-borders
            DocumentHtmlReader(:html='generatedDocument.html')
        .q-mb-md
          q-btn(
            color='primary'
            label='Подписать договор'
            :loading='isGenerating'
            @click='signGeneratedDocument'
          )

      // Ошибка генерации
      template(v-else-if='generationError')
        .q-mb-md
          .text-center.text-negative.q-mb-md
            | Ошибка при генерации договора.
          .text-center
            q-btn(
              color='primary'
              label='Повторить генерацию'
              :loading='isGenerating'
              @click='regenerateDocument'
            )

    // Соглашение с программой капитализации
    template(v-else-if='!isCapitalProgramAgreed')
      .text-h6.q-mb-md Соглашение о целевой потребительской программе
      .text-body2.q-mb-lg
        | Для участия в программе капитализации необходимо согласиться с условиями целевой потребительской программы.
        br
        | Программа определяет правила накопления и использования капитала.
      .q-mb-md
        q-btn(
          color='primary'
          label='Согласен с условиями программы'
          :loading='isAgreementSigning'
          @click='signAgreement'
        )
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { useContributorStore } from 'app/extensions/capital/entities/Contributor/model';
import { useWalletStore } from 'src/entities/Wallet';
import { CapitalProgramAgreementId } from 'app/extensions/capital/shared/lib';
import { useRegisterContributor } from 'app/extensions/capital/features/Contributor/RegisterContributor';
import { DocumentHtmlReader } from 'src/shared/ui/DocumentHtmlReader';
import { Loader } from 'src/shared/ui/Loader';
import { FailAlert, SuccessAlert } from 'src/shared/api';

const contributorStore = useContributorStore();
const walletStore = useWalletStore();

const {
  registerContributorWithGeneratedDocument,
  generateDocument,
  regenerateDocument,
  isGenerating,
  generatedDocument,
  generationError
} = useRegisterContributor();

const isAgreementSigning = ref(false);
const isInitialLoading = ref(false);

// Computed флаги
const isContracted = computed(() => {
  return !!contributorStore.self?.contract;
});

const isCapitalProgramAgreed = computed(() => {
  return walletStore.agreements.some(agreement => agreement.program_id === CapitalProgramAgreementId);
});

// Генерация документа при монтировании
onMounted(() => {
  if (!isContracted.value) {
    isInitialLoading.value = true;
    generateDocument()
      .then(() => {
        // Генерация успешна
      })
      .catch((error) => {
        console.error('Ошибка при генерации договора:', error);
        generationError.value = true;
        FailAlert('Не удалось сгенерировать договор участия');
      })
      .finally(() => {
        isInitialLoading.value = false;
      });
  }
});

// Подпись и регистрация с сгенерированным документом
const signGeneratedDocument = async () => {
  try {
    await registerContributorWithGeneratedDocument();
    SuccessAlert('Договор участия успешно подписан и отправлен');
  } catch (error) {
    console.error('Ошибка при подписании документа:', error);
    FailAlert(error);
  }
};

// Имитация подписания соглашения с программой
const signAgreement = async () => {
  isAgreementSigning.value = true;
  try {
    // Имитируем задержку для подписания документа
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('Соглашение с программой подписано');
    // Здесь должна быть логика реального подписания
  } catch (error) {
    console.error('Ошибка при подписании соглашения:', error);
  } finally {
    isAgreementSigning.value = false;
  }
};
</script>
