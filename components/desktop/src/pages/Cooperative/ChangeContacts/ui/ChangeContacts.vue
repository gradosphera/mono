<template lang="pug">
div.page-shell
  q-card.hero-card(flat)
    .hero-title Контакты кооператива
    .hero-subtitle
      | Эти контакты показываются пайщикам и в подвале сайта для
      | незарегистрированных пользователей. Держите их актуальными.

  q-card.surface-card(flat)
    .section-title Публичные контакты
    .section-note Данные для связи с кооперативом.

    q-input(
      v-model="phone"
      standout="bg-teal text-white"
      dense
      label="Телефон"
      type="tel"
    )
    q-input(
      v-model="email"
      standout="bg-teal text-white"
      dense
      label="Электронная почта"
      type="email"
    )

    .action-row
      q-btn(@click='update' color="primary" unelevated size="md")
        q-icon(name="save").q-mr-sm
        span Сохранить контакты
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import { useUpdateMeta } from 'src/features/User/UpdateMeta';
import { FailAlert, SuccessAlert } from 'src/shared/api';
import { useSystemStore } from 'src/entities/System/model';
import { useCooperativeStore } from 'src/entities/Cooperative';

const { info } = useSystemStore();
const coop = useCooperativeStore();
const phone = ref<string>('');
const email = ref<string>('');

watch(
  () => info.contacts,
  (newValue) => {
    if (newValue) {
      phone.value = newValue.phone;
      email.value = newValue.email;
    }
  },
  { immediate: true },
);

coop.loadPublicCooperativeData(info.coopname);

const update = async () => {
  const { updateMeta } = useUpdateMeta();

  try {
    await updateMeta(info.coopname, {
      phone: phone.value || '',
      email: email.value || '',
    });

    SuccessAlert('Контакты успешно обновлены');
  } catch (e: any) {
    FailAlert(`Возникла ошибка при обновлении: ${e.message}`);
  }
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
