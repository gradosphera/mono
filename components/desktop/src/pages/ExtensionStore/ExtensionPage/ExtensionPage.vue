<template lang="pug">
.row(v-if='extension')
  .col-md-3.col-sm-4.col-xs-12.q-pa-md
    q-img(v-if='extension.image', :src='extension.image')
    .q-mt-md
      .row(v-if='isSettings')
        SaveButton(
          :extension-name='extension?.name',
          :extension-enabled='extension?.enabled',
          :config='data',
          :my-form-ref='myFormRef',
          :is-empty='isEmpty'
        )
        CancelButton
      .q-gutter-sm.text-center(v-if='isMain && !extension.is_installed')
        q-btn.full-width(
          color='teal',
          @click='router.push({ name: "extension-install" })'
        ) установить

      .q-gutter-sm.text-center(v-if='isInstall && !extension.is_installed')
        // это установка
        InstallButton(
          :extension-name='extension?.name',
          :config='data',
          :my-form-ref='myFormRef'
        )

      div(v-if='isMain && extension.is_installed')
        SettingsButton
        .q-mt-sm(v-if='extension.is_builtin')
          p.text-center.text-grey минимальное расширение
        .row(v-else)
          .col-6.q-pa-sm
            DisableButton(
              :extension='extension',
              :disabled='extension.is_builtin'
            )
            EnableButton(
              :extension-name='extension.name',
              :config='extension.config',
              :disabled='extension.is_builtin'
            )

          .col-6.q-pa-sm
            UninstallButton(
              :extension-name='extension.name',
              :disabled='extension.is_builtin'
            )

  .col-md-9.col-sm-8.col-xs-12.q-pa-md
    .info-card(v-if='isMain')
      div
        span.text-h1 {{ extension.title }}
          //- q-chip(square dense size="sm" color="green" outline v-if="extension.is_installed && extension.enabled").q-ml-sm установлено
          //- q-chip(square dense size="sm" color="orange" outline v-if="extension.is_installed && !extension.enabled").q-ml-sm отключено
          q-chip(
            size='sm',
            dense,
            color='orange',
            v-if='!extension.is_available',
            outline
          ) в разработке
        div
          q-chip(
            outline,
            v-for='tag in extension.tags',
            v-bind:key='tag',
            dense,
            size='sm'
          ) {{ tag }}

      ClientOnly
        template(#default)
          vue-markdown.description.q-mt-md(:source='extension.readme')
    .info-card(v-if='(isSettings || isInstall) && extension.schema')
      q-form(ref='myFormRef')
        div(v-if='isEmpty && !isInstall')
          .q-pa-md
            p.text-h6 Нет настроек
            span Расширение не предоставило настроек для изменения.
        div(v-if='!isEmpty && !isInstall')
          //- vue-markdown(:source="extension.instructions").description.q-mt-md
          ClientOnly
            template(#default)
              vue-markdown.description.q-mt-md(
                v-if='extension.instructions && isInstall',
                :source='extension.instructions'
              )
          div
            p.text-h5 Настройки
            ZodForm.q-mt-lg(:schema='extension.schema', v-model='data')
</template>
<script lang="ts" setup>
import { useExtensionStore } from 'src/entities/Extension/model';
import { computed, onMounted, ref, watch, defineAsyncComponent } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ZodForm } from 'src/shared/ui/ZodForm';
// import VueMarkdown from 'vue-markdown-render'
import {
  SaveButton,
  CancelButton,
  SettingsButton,
} from 'src/features/Extension/UpdateExtension';
import { UninstallButton } from 'src/features/Extension/UninstallExtension';
import { InstallButton } from 'src/features/Extension/InstallExtension';
import { EnableButton } from 'src/features/Extension/EnableExtension';
import { DisableButton } from 'src/features/Extension/DisableExtension';
import { ClientOnly } from 'src/shared/ui/ClientOnly';

// Клиентский компонент для markdown, загружаемый только на клиенте
const VueMarkdown = defineAsyncComponent(() =>
  import('vue-markdown-render').then((mod) => mod.default),
);

const route = useRoute();
const router = useRouter();
const extStore = useExtensionStore();
const data = ref({});
const myFormRef = ref();

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

const isEmpty = computed(() => {
  if (extension.value?.schema)
    return Object.keys(extension.value?.schema.properties).length == 0;
  else return false;
});
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
