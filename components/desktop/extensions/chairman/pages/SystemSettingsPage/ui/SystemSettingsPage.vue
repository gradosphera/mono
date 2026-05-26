<template lang="pug">
.settings-page
  .settings-page__head
    h2.settings-page__title Стартовые страницы
    p.settings-page__sub
      | Настройте рабочие столы и страницы, которые будут открываться по
      | умолчанию для новых пользователей при входе на сайт. Единый стиль
      | помогает быстрее понять, что важно сделать в первую очередь.

  q-card(flat)
    q-card-section
      DefaultPagesForm(
        :loading='saving'
        @submit='onSubmit'
        @success='onSuccess'
        @error='onError'
      )
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useSystemStore } from 'src/entities/System/model';
import { DefaultPagesForm } from 'app/extensions/chairman/features/UpdateSettings/ui';

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
  console.error('Ошибка сохранения настроек:', error);
};
</script>

<style scoped lang="scss">
// Канон-отступы страницы + единый заголовок-шапка (как на прочих столах).
.settings-page {
  display: flex;
  flex-direction: column;
  gap: var(--p-5, 20px);
  padding: var(--p-6, 24px);
  @media (max-width: 768px) {
    padding: var(--p-4, 16px);
  }
}
.settings-page__head {
  display: flex;
  flex-direction: column;
  gap: var(--p-2, 8px);
}
.settings-page__title {
  margin: 0;
  font-size: var(--p-fs-h2);
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--p-ink);
}
.settings-page__sub {
  margin: 0;
  font-size: var(--p-fs-body);
  line-height: 1.55;
  color: var(--p-ink-2);
}
</style>
