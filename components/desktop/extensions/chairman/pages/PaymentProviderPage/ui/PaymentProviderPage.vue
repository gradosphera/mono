<template lang="pug">
div.page-shell
  q-card.hero-card(flat)
    .hero-title Провайдер платежей
    .hero-subtitle
      | Выберите провайдера входящих платежей по умолчанию для вашего кооператива.
      | Этот провайдер будет использоваться для создания и обработки платежей пайщиков.

    PaymentProviderForm(
      :loading='saving'
      @submit='onSubmit'
      @success='onSuccess'
      @error='onError'
    )
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useSystemStore } from 'src/entities/System/model';
import { PaymentProviderForm } from 'app/extensions/chairman/features/PaymentProvider';

const saving = ref(false);
const systemStore = useSystemStore();

onMounted(async () => {
  if (!systemStore.info) {
    await systemStore.loadSystemInfo();
  }
});

const onSubmit = () => {
  saving.value = true;
};

const onSuccess = () => {
  saving.value = false;
};

const onError = (error: Error) => {
  saving.value = false;
  console.error('Ошибка сохранения провайдера платежей:', error);
};
</script>

<style scoped lang="scss">
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
  max-width: 820px;
}

.surface-card {
  border-radius: 16px;
  padding: 16px 18px;
}
</style>
