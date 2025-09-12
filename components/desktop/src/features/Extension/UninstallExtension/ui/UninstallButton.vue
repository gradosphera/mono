<template lang="pug">
q-btn.full-width(
  size='sm',
  @click='uninstall',
  flat,
  :disabled='disabled',
  :loading='isUninstalling'
)
  q-icon.text-grey(name='delete')
  span.q-ml-xs удалить
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUninstallExtension } from '../model';
import { useDesktopStore } from 'src/entities/Desktop/model';
import {
  extractGraphQLErrorMessages,
  FailAlert,
  SuccessAlert,
} from 'src/shared/api';

interface Props {
  extensionName: string;
  disabled?: boolean;
}

const props = defineProps<Props>();

const router = useRouter();
const desktop = useDesktopStore();
const isUninstalling = ref(false);

const uninstall = async () => {
  const { uninstallExtension } = useUninstallExtension();
  isUninstalling.value = true;

  try {
    await uninstallExtension(props.extensionName);
    router.push({ name: 'one-extension' });
    desktop.loadDesktop();
    SuccessAlert('Расширение удалено');
  } catch (e: any) {
    FailAlert(`Ошибка удаления расширения: ${extractGraphQLErrorMessages(e)}`);
  } finally {
    isUninstalling.value = false;
  }
};
</script>
