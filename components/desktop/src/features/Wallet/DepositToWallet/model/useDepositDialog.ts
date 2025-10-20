import { ref } from 'vue';

const showDepositDialog = ref(false);

export function useDepositDialog() {
  const open = () => {
    showDepositDialog.value = true;
  };

  const close = () => {
    showDepositDialog.value = false;
  };

  return {
    showDialog: showDepositDialog,
    open,
    close,
  };
}

