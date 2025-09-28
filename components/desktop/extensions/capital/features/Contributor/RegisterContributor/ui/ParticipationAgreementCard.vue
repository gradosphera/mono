<template lang="pug">
.q-mb-md
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
</template>

<script lang="ts" setup>
import { onMounted } from 'vue';
import { useRegisterContributor } from '../model';
import { DocumentHtmlReader } from 'src/shared/ui/DocumentHtmlReader';
import { FailAlert, SuccessAlert } from 'src/shared/api';

const {
  registerContributorWithGeneratedDocument,
  generateDocument,
  regenerateDocument,
  isGenerating,
  generatedDocument,
  generationError
} = useRegisterContributor();

// Генерация документа при монтировании
onMounted(() => {
  generateDocument()
    .then(() => {
      // Генерация успешна
    })
    .catch((error) => {
      console.error('Ошибка при генерации договора:', error);
      generationError.value = true;
      FailAlert('Не удалось сгенерировать договор участия');
    });
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
</script>
