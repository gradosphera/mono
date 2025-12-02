<template lang="pug">
.row(v-if='extension')
  .col-md-3.col-sm-4.col-xs-12.q-pa-md
    ExtensionImage(:image='extension?.image ?? undefined')
    .q-mt-md
      ExtensionActions(
        :extension='extension',
        :mode='currentMode',
        :config='data',
        :form-ref='myFormRef',
        :is-empty='isEmpty'
      )

  .col-md-9.col-sm-8.col-xs-12.q-pa-md
    ExtensionInfo(v-if='isMain', :extension='extension')
    ExtensionSettings(
      v-if='isSettings && extension.schema',
      :schema='extension.schema',
      v-model:config='data',
      :form-ref='myFormRef'
    )
    ExtensionInstall(
      v-if='isInstall',
      :schema='extension.schema',
      v-model:config='data',
      :form-ref='myFormRef'
    )
</template>
<script lang="ts" setup>
import { useExtensionStore } from 'src/entities/Extension/model';
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useBackButton } from 'src/shared/lib/navigation';
import { isExtensionSchemaEmpty } from 'src/shared/lib/utils';
import { ExtensionImage } from 'src/widgets/ExtensionImage';
import { ExtensionActions } from 'src/widgets/ExtensionActions';
import { ExtensionInfo } from 'src/widgets/ExtensionInfo';
import { ExtensionSettings } from 'src/widgets/ExtensionSettings';
import { ExtensionInstall } from 'src/widgets/ExtensionInstall';

const route = useRoute();
const router = useRouter();
const extStore = useExtensionStore();
const data = ref({});
const myFormRef = ref();


// Настраиваем кнопку "Назад" в хедере
const backButtonClick = () => {
  if (route.name === 'one-extension') {
    // На главной странице расширения - возвращаемся к списку расширений
    router.push({ name: 'extensions' });
  } else if (route.name === 'extension-install' || route.name === 'extension-settings') {
    // На страницах установки/настроек - возвращаемся на главную страницу расширения
    router.push({ name: 'one-extension', params: { name: route.params.name } });
  }
};

useBackButton({
  text: 'Назад',
  componentId: 'extension-page',
  onClick: backButtonClick
});

onMounted(async () => {
  if (route.params.name) {
    await extStore.loadExtensions({ name: route.params.name as string });
  }
});

const extension = computed(() =>
  extStore.extensions.find((el) => el.name == route.params.name),
);

watch(extension, (newValue) => {
  if (newValue) data.value = newValue.config;
});

const isMain = computed(() => route.name == 'one-extension');
const isInstall = computed(() => route.name == 'extension-install');
const isSettings = computed(() => route.name == 'extension-settings');

const currentMode = computed(() => {
  if (isMain.value) return 'main';
  if (isInstall.value) return 'install';
  if (isSettings.value) return 'settings';
  return 'main';
});

const isEmpty = computed(() => isExtensionSchemaEmpty(extension.value?.schema));
</script>

<style>
.description h1 {
  font-size: 1.7rem !important;
  margin: 0px !important;
}
.description h2 {
  font-size: 1.5rem !important;
  margin: 0px !important;
}
.description h3 {
  font-size: 1.4rem !important;
  margin: 0px !important;
}
.description h4 {
  font-size: 1.3rem !important;
  margin: 0px !important;
}
.description h5 {
  font-size: 1.2rem !important;
  margin: 0px !important;
}
.description h6 {
  font-size: 1.1rem !important;
  margin: 0px !important;
}
.description ul {
  margin: 0px !important;
}
</style>
