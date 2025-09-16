<template lang="pug">
.q-pa-md
  q-card(flat)
    q-card-section
      .q-gutter-md
        .config-field
          .field-description
            .text-body2.text-weight-medium Описание
            .text-caption Процент от общего числа голосов, который автоматически выделяется авторам предложений при голосовании. Это обеспечивает авторам базовый уровень влияния на принятие решений.
          .field-input
            q-input(
              v-model.number='setConfigInput.config.authors_voting_percent',
              label='Процент пула премий авторов',
              outlined,
              type='number',
              min='0',
              max='100',
              suffix='%'
            )

        .config-field
          .field-description
            .text-body2.text-weight-medium Описание
            .text-caption Дополнительный процент бонуса, который получает координатор проекта сверх его обычной доли. Это мотивирует координаторов к более эффективному управлению проектами.
          .field-input
            q-input(
              v-model.number='setConfigInput.config.coordinator_bonus_percent',
              label='Бонус координатора',
              outlined,
              type='number',
              min='0',
              max='100',
              suffix='%'
            )

        .config-field
          .field-description
            .text-body2.text-weight-medium Описание
            .text-caption Максимальный срок действия приглашений, которые координатор может отправлять новым участникам. После истечения этого срока приглашения становятся недействительными.
          .field-input
            q-input(
              v-model.number='setConfigInput.config.coordinator_invite_validity_days',
              label='Срок действия приглашения координатора',
              outlined,
              type='number',
              min='1',
              suffix='дней'
            )

        .config-field
          .field-description
            .text-body2.text-weight-medium Описание
            .text-caption Процент от общего числа голосов, который выделяется создателям кооператива. Это обеспечивает учредителям постоянное влияние на ключевые решения организации.
          .field-input
            q-input(
              v-model.number='setConfigInput.config.creators_voting_percent',
              label='Процент голосования создателей',
              outlined,
              type='number',
              min='0',
              max='100',
              suffix='%'
            )

        .config-field
          .field-description
            .text-body2.text-weight-medium Описание
            .text-caption Процент от общих расходов кооператива, который автоматически направляется в резервный фонд для непредвиденных ситуаций и развития организации.
          .field-input
            q-input(
              v-model.number='setConfigInput.config.expense_pool_percent',
              label='Процент расходов на пул',
              outlined,
              type='number',
              min='0',
              max='100',
              suffix='%'
            )

        .config-field
          .field-description
            .text-body2.text-weight-medium Описание
            .text-caption Максимальная продолжительность периода голосования по предложениям в днях. После истечения этого времени голосование автоматически завершается.
          .field-input
            q-input(
              v-model.number='setConfigInput.config.voting_period_in_days',
              label='Период голосования',
              outlined,
              type='number',
              min='1',
              suffix='дней'
            )

    q-separator

    q-card-actions(align='right')
      q-btn(
        @click='handleReset',
        color='grey-7',
        icon='refresh',
        label='Сбросить изменения',
        flat
      )
      q-btn(
        @click='handleSave',
        :loading='loading',
        color='primary',
        icon='save',
        label='Сохранить конфигурацию',
        unelevated
      )
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useSetConfig } from 'app/extensions/capital/features/Config/SetConfig/model';
import { useConfigStore } from 'app/extensions/capital/entities/Config/model';
import { useSystemStore } from 'src/entities/System/model';
import { FailAlert, NotifyAlert, SuccessAlert } from 'src/shared/api';

const { setConfig, setConfigInput } = useSetConfig();
const configStore = useConfigStore();
const { info } = useSystemStore();

const loading = ref(false);

// Устанавливаем coopname из системного store
onMounted(() => {
  setConfigInput.value.coopname = info.coopname;
});

// Загружаем текущее состояние при монтировании
onMounted(async () => {
  try {
    await configStore.loadState({ coopname: info.coopname });
    console.log('loaded state: ', configStore.state);
    if (configStore.state?.config) {
      // Заполняем форму текущими значениями из конфигурации состояния
      setConfigInput.value.config = { ...configStore.state.config };
    }
  } catch (error) {
    console.error('Ошибка при загрузке состояния:', error);
    FailAlert('Не удалось загрузить текущее состояние кооператива');
  }
});

// Обработчик сохранения
const handleSave = async () => {
  loading.value = true;
  try {
    await setConfig(setConfigInput.value);
    SuccessAlert('Конфигурация успешно сохранена');

    // Перезагружаем состояние после сохранения
    await configStore.loadState({ coopname: info.coopname });

    // Обновляем форму актуальными значениями из состояния
    if (configStore.state?.config) {
      setConfigInput.value.config = { ...configStore.state.config };
    }
  } catch (error: any) {
    console.error('Ошибка при сохранении конфигурации:', error);
    FailAlert(error);
  } finally {
    loading.value = false;
  }
};

// Обработчик сброса
const handleReset = () => {
  // Сбрасываем к значениям из store или к пустым значениям
  if (configStore.state?.config) {
    setConfigInput.value.config = { ...configStore.state.config };
  } else {
    setConfigInput.value.config = {
      authors_voting_percent: 38.2,
      coordinator_bonus_percent: 5,
      coordinator_invite_validity_days: 30,
      creators_voting_percent: 38.2,
      expense_pool_percent: 100,
      voting_period_in_days: 2,
    };
  }

  NotifyAlert('Изменения сброшены');
};
</script>

<style lang="scss" scoped>
.config-field {
  margin-bottom: 24px;

  &:last-child {
    margin-bottom: 0;
  }
}

// Десктопная версия: описание слева, поле справа
@media (min-width: 769px) {
  .config-field {
    display: flex;
    gap: 24px;
    align-items: flex-start;
  }

  .field-description {
    flex: 1;
    min-width: 200px;
  }

  .field-input {
    flex: 1;
  }
}

// Мобильная версия: описание сверху, поле снизу
@media (max-width: 768px) {
  .field-description {
    margin-bottom: 12px;
  }

  .q-card-actions {
    flex-direction: column;
    align-items: stretch;

    .q-btn {
      margin-left: 0;
      margin-top: 8px;
    }
  }
}
</style>
