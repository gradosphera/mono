<template lang="pug">
div
  LedgerAccountsTable(
    :accounts='ledgerStore.ledgerState?.chartOfAccounts || []',
    :loading='loading'
  )
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useLedgerAccountStore } from 'src/entities/LedgerAccount/model';
import { LedgerAccountsTable } from 'src/widgets/LedgerAccounts';
import { FailAlert } from 'src/shared/api';
import { useSystemStore } from 'src/entities/System/model';

const ledgerStore = useLedgerAccountStore();
const loading = ref(false);
const { info } = useSystemStore();

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

onMounted(() => {
  loadLedgerAccounts();
});
</script>
