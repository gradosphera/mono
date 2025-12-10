<template lang="pug">
div
  LedgerHistoryTable(
    :filter='historyFilter',
    @error='handleHistoryError'
  )
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { LedgerHistoryTable } from 'src/widgets/LedgerAccounts';
import { FailAlert } from 'src/shared/api';
import { useSystemStore } from 'src/entities/System/model';
import type { ILedgerHistoryFilter } from 'src/entities/LedgerAccount/types';

const { info } = useSystemStore();

// Фильтр для истории операций - показываем все операции кооператива
const historyFilter = computed<ILedgerHistoryFilter>(() => ({
  coopname: info.coopname,
  // account_id не указываем, чтобы получить все операции
}));

const handleHistoryError = (error: any) => {
  FailAlert(error);
};
</script>
