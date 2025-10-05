<template lang="pug">
q-btn.full-width(color='teal', @click='install', :loading='isInstalling') включить
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useInstallExtension } from '../model';
import { useDesktopStore } from 'src/entities/Desktop/model';
import { loadExtensionRoutes } from 'src/processes/init-installed-extensions';
import {
  extractGraphQLErrorMessages,
  FailAlert,
  SuccessAlert,
} from 'src/shared/api';

interface Props {
  extensionName: string;
  config: any;
  myFormRef?: any;
}

const props = defineProps<Props>();

const router = useRouter();
const desktop = useDesktopStore();
const isInstalling = ref(false);

const validateForm = async () => {
  return await props.myFormRef?.value?.validate();
};

const install = async () => {
  console.log('install', props.extensionName, props.config, props.myFormRef)
  const is_valid = await validateForm();
  console.log('is_valid', is_valid)
  if (is_valid === false) return;

  const { installExtension } = useInstallExtension();
  isInstalling.value = true;

  try {
    await installExtension(props.extensionName, true, props.config);
    // Сначала загружаем обновленный desktop с сервера
    await desktop.loadDesktop();
    // Затем динамически загружаем маршруты для установленного расширения
    await loadExtensionRoutes(props.extensionName, router);
    router.push({ name: 'one-extension' });
    SuccessAlert('Расширение установлено');
  } catch (e: unknown) {
    FailAlert(`Ошибка установки расширения: ${extractGraphQLErrorMessages(e)}`);
  } finally {
    isInstalling.value = false;
  }
};
</script>
