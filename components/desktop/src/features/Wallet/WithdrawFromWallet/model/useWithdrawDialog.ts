import { ref } from 'vue';

const showWithdrawDialog = ref(false);

export function useWithdrawDialog() {
  const open = () => {
    showWithdrawDialog.value = true;
  };

  const close = () => {
    showWithdrawDialog.value = false;
  };

  return {
    showDialog: showWithdrawDialog,
    open,
    close,
  };
}

