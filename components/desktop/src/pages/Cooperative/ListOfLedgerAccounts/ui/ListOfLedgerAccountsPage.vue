<template lang="pug">
div
  //- Переключатель между счетами и историей
  .row.justify-center.q-mb-lg
    .col-12
      q-btn-toggle.full-width(
        size='sm',
        :model-value='viewMode',
        @update:model-value='onViewModeChange',
        spread,
        toggle-color='teal',
        color='white',
        text-color='black',
        :options='[ { label: "План счетов", value: "accounts" }, { label: "История операций", value: "history" }, ]'
      )

  //- Отображение счетов или истории в зависимости от режима
  LedgerAccountsTable(
    v-if='viewMode === "accounts"',
    :accounts='ledgerStore.ledgerState?.chartOfAccounts || []',
    :loading='loading',
    @history-error='handleHistoryError'
  )

  LedgerHistoryTable(
    v-if='viewMode === "history"',
    :filter='historyFilter',
    @error='handleHistoryError'
  )
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useLedgerAccountStore } from 'src/entities/LedgerAccount/model';
import {
  LedgerAccountsTable,
  LedgerHistoryTable,
} from 'src/widgets/LedgerAccounts';
import { FailAlert } from 'src/shared/api';
import { useSystemStore } from 'src/entities/System/model';
import type { ILedgerHistoryFilter } from 'src/entities/LedgerAccount/types';

const ledgerStore = useLedgerAccountStore();
const loading = ref(false);
const { info } = useSystemStore();

// Режим отображения: счета или история
const viewMode = ref<'accounts' | 'history'>('accounts');

// Фильтр для истории операций - показываем все операции кооператива
const historyFilter = computed<ILedgerHistoryFilter>(() => ({
  coopname: info.coopname,
  // account_id не указываем, чтобы получить все операции
}));

// Обработчик изменения режима отображения
const onViewModeChange = (newMode: 'accounts' | 'history') => {
  viewMode.value = newMode;
};

const loadLedgerAccounts = async () => {
  try {
    loading.value = true;
    await ledgerStore.getLedgerState({ coopname: info.coopname });
  } catch (e: any) {
    FailAlert(e);
  } finally {
    loading.value = false;
  }
};

const handleHistoryError = (error: any) => {
  FailAlert(error);
};

onMounted(() => {
  loadLedgerAccounts();
});
</script>
