<template lang="pug">
.membership-exit-confirm.row.justify-center
  .col-12.col-md-6.text-center.q-pt-xl
    template(v-if='loading')
      q-spinner(size='56px', color='primary')
      div.text-h6.q-mt-md Подтверждаем выход из кооператива…

    template(v-else-if='error')
      q-icon(name='error_outline', size='56px', color='negative')
      div.text-h6.q-mt-md Не удалось подтвердить выход
      p.text-body2.text-grey-7.q-mt-sm {{ error }}
      BaseButton.q-mt-lg(variant='secondary', label='Вернуться в кабинет', @click='goToCabinet')

    template(v-else)
      q-icon(name='check_circle', size='56px', color='positive')
      div.text-h6.q-mt-md Выход подтверждён
      p.text-body2.text-grey-7.q-mt-sm Заявление отправлено. Процесс выхода запущен — ожидайте решения Совета.
      BaseButton.q-mt-lg(variant='primary', label='Продолжить', @click='goToCabinet')
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { BaseButton } from 'src/shared/ui/base/BaseButton';
import { useSystemStore } from 'src/entities/System/model';
import { useMembershipExit, useExitGate } from 'src/features/Membership/ExitFromCoop';

const route = useRoute();
const router = useRouter();
const { info } = useSystemStore();
const { confirmExit } = useMembershipExit();
const { loadExitStatus } = useExitGate();

const loading = ref(true);
const error = ref<string | null>(null);

const goToCabinet = (): void => {
  router.replace({ name: 'wallet', params: { coopname: info.coopname } });
};

onMounted(async () => {
  const token = String(route.query.token || '');
  if (!token) {
    error.value = 'Ссылка некорректна: отсутствует токен подтверждения.';
    loading.value = false;
    return;
  }
  try {
    await confirmExit(token);
    await loadExitStatus();
  } catch (e: any) {
    error.value =
      e?.message || 'Ссылка недействительна или срок её действия истёк. Подайте заявление заново.';
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped lang="scss">
.membership-exit-confirm {
  padding: var(--p-6, 24px);
}
</style>
