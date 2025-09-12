<template lang="pug">
q-btn.full-width(
  v-if='extension.enabled',
  size='sm',
  @click='disable',
  flat,
  :disabled='disabled',
  :loading='isDisabling'
)
  q-icon(name='fa-solid fa-toggle-on')
  span.q-ml-xs включено
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useDisableExtension } from '../model';
import { useDesktopStore } from 'src/entities/Desktop/model';
import {
  extractGraphQLErrorMessages,
  FailAlert,
  SuccessAlert,
} from 'src/shared/api';

import type { IExtension } from 'src/entities/Extension/model';

interface Props {
  extension: IExtension;
  disabled?: boolean;
}

const props = defineProps<Props>();

const desktop = useDesktopStore();
const isDisabling = ref(false);

const disable = async () => {
  const { disableExtension } = useDisableExtension();
  isDisabling.value = true;

  try {
    await disableExtension(props.extension.name, props.extension.config);
    // Если расширение отключено, удаляем его workspace
    desktop.removeWorkspace(props.extension.name);
    SuccessAlert('Расширение обновлено');
  } catch (e: unknown) {
    FailAlert(
      `Ошибка отключения расширения: ${extractGraphQLErrorMessages(e)}`,
    );
  } finally {
    isDisabling.value = false;
  }
};
</script>
