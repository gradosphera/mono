<template lang="pug">
div.page-shell
  q-card.hero-card(flat)
    .hero-title Ключ кооператива
    .hero-subtitle
      | Приватный ключ используется для подписи транзакций в блокчейне. Хранится
      | зашифрованным на сервере. Обновляйте его при смене ключа у аккаунта
      | кооператива или при восстановлении доступа.

  q-card.surface-card(flat)
    .section-title Приватный ключ
    .section-note Введите новый приватный ключ, чтобы заменить текущий.

    q-input(
      v-model='privateKey'
      label='Приватный ключ'
      type='password'
      standout="bg-teal text-white"
      dense
      :loading='loading'
      :disable='loading'
      hint='Ключ не отображается после сохранения'
    )
      template(#prepend)
        q-icon(name='key')

    .action-row
      q-btn(
        :loading='loading'
        :disable='!privateKey || loading'
        @click='updateKey'
        color='primary'
        unelevated
        size='md'
      )
        q-icon.q-mr-sm(name='update')
        | Обновить ключ
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useSetCooperativeKey } from 'src/features/System/SetCooperativeKey';
import {
  SuccessAlert,
  FailAlert,
  extractGraphQLErrorMessages,
} from 'src/shared/api';

const { setCooperativeKey } = useSetCooperativeKey();

const privateKey = ref('');
const loading = ref(false);

onMounted(() => {
  privateKey.value = '5********************************';
});

const updateKey = async () => {
  if (!privateKey.value || privateKey.value === '5********************************') {
    FailAlert('Пожалуйста, введите действительный приватный ключ');
    return;
  }

  try {
    loading.value = true;

    await setCooperativeKey(privateKey.value);

    privateKey.value = '5********************************';

    SuccessAlert('Ключ кооператива успешно обновлен');
  } catch (error: any) {
    FailAlert(`Ошибка обновления ключа: ${extractGraphQLErrorMessages(error)}`);
  } finally {
    loading.value = false;
  }
};
</script>

<style lang="scss" scoped>
.page-shell {
  width: 100%;
  padding: 24px 12px 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.hero-card {
  border-radius: 18px;
  padding: 18px 20px;
}

.hero-title {
  font-size: 22px;
  font-weight: 600;
}

.hero-subtitle {
  line-height: 1.55;
  max-width: 900px;
}

.surface-card {
  border-radius: 16px;
  padding: 18px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
}

.section-note {
  line-height: 1.45;
}

.action-row {
  display: flex;
  justify-content: flex-start;
  padding-top: 6px;
}
</style>
