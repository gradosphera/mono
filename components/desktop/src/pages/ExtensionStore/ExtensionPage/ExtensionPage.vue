<template lang="pug">
div(v-if="extension").row
  div.col-md-3.col-sm-4.col-xs-12.q-pa-md
    q-img(v-if="extension.image" :src="extension.image")
    div.q-mt-md
      div(v-if="isSettings").row
        q-btn( v-if="!isEmpty" color="teal" @click="save").full-width сохранить
        q-btn( v-if="isEmpty" @click="cancel" flat icon="fas fa-arrow-left").full-width назад
      div(v-if="isMain && !extension.is_installed").q-gutter-sm.text-center
        q-btn(color="teal" @click="router.push({name: 'extension-install'})").full-width установить

      div(v-if="isInstall && !extension.is_installed").q-gutter-sm.text-center
        // это установка
        q-btn(color="teal" @click="install").full-width включить

      div(v-if="isMain && extension.is_installed")
        q-btn(color="teal" @click="openSettings").full-width настройки
        div(v-if="extension.is_builtin").q-mt-sm
          p.text-center.text-grey минимальное расширение
        div(v-else).row
          div.col-6.q-pa-sm
            q-btn(v-if="extension.enabled" size="sm" @click="disable" flat :disabled="extension.is_builtin").full-width
              q-icon(name="fa-solid fa-toggle-on")
              span.q-ml-xs включено

            q-btn( size="sm" @click="enable" v-if="!extension.enabled" flat :disabled="extension.is_builtin").full-width
              q-icon(name="fa-solid fa-toggle-off").text-grey
              span.q-ml-xs отключено

          div.col-6.q-pa-sm
            q-btn( size="sm" @click="uninstall" v-if="extension.is_installed" flat :disabled="extension.is_builtin").full-width
              q-icon(name="delete").text-grey
              span.q-ml-xs удалить

  div.col-md-9.col-sm-8.col-xs-12.q-pa-md
    div(v-if="isMain")
      div
        span.text-h1 {{extension.title}}
          //- q-chip(square dense size="sm" color="green" outline v-if="extension.is_installed && extension.enabled").q-ml-sm установлено
          //- q-chip(square dense size="sm" color="orange" outline v-if="extension.is_installed && !extension.enabled").q-ml-sm отключено
          q-chip(size="sm" dense color="orange" v-if="!extension.is_available" outline) в разработке
        div
          q-chip(outline v-for="tag in extension.tags" v-bind:key="tag" dense size="sm") {{tag}}

      ClientOnly
        template(#default)
          vue-markdown(:source="extension.readme").description.q-mt-md
    div(v-if="(isSettings || isInstall) && extension.schema")
      q-form(ref="myFormRef")
        div(v-if="isEmpty && !isInstall")
          div.q-pa-md
            p.text-h6 Нет настроек
            span Расширение не предоставило настроек для изменения.
        div(v-if="!isEmpty")

          //- vue-markdown(:source="extension.instructions").description.q-mt-md
          ClientOnly
            template(#default)
              vue-markdown(v-if="extension.instructions" :source="extension.instructions").description.q-mt-md
          ZodForm(:schema="extension.schema" v-model="data")

</template>
<script lang="ts" setup>
import { useExtensionStore } from 'src/entities/Extension/model';
import { computed, onMounted, ref, watch, defineAsyncComponent } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ZodForm } from 'src/shared/ui/ZodForm';
// import VueMarkdown from 'vue-markdown-render'
import { extractGraphQLErrorMessages, FailAlert, SuccessAlert } from 'src/shared/api';
import { useUpdateExtension } from 'src/features/Extension/UpdateExtension';
import { useUninstallExtension } from 'src/features/Extension/UninstallExtension';
import { useInstallExtension } from 'src/features/Extension/InstallExtension';
import { useDesktopStore } from 'src/entities/Desktop/model';
import { ClientOnly } from 'src/shared/ui/ClientOnly';

// Клиентский компонент для markdown, загружаемый только на клиенте
const VueMarkdown = defineAsyncComponent(() =>
  import('vue-markdown-render').then(mod => mod.default)
);

const route = useRoute();
const router = useRouter();
const extStore = useExtensionStore();
const data = ref({});
const myFormRef = ref();
const desktop = useDesktopStore()

onMounted(async () => {
  if (route.params.name) {
    await extStore.loadExtensions({ name: route.params.name as string });
  }
});

const extension = computed(() => extStore.extensions.find(el => el.name == route.params.name));

const validateForm = async () => {
  return await myFormRef.value?.validate();
};

watch(extension, (newValue) => {
  if (newValue)
    data.value = newValue.config;
});

const openSettings = () => {
  router.push({ name: 'extension-settings' });
};


const cancel = () => {
  router.push({ name: 'one-extension' });
};

const save = async () => {
  const is_valid = await validateForm();
  if (!is_valid) return;

  const { updateExtension } = useUpdateExtension();
  if (extension.value) {
    try {
      await updateExtension(extension.value.name, extension.value.enabled, data.value);
      SuccessAlert('Расширение обновлено');
      router.push({ name: 'one-extension' });
    } catch (e: unknown) {
      FailAlert(`Ошибка сохранения расширения: ${extractGraphQLErrorMessages(e)}`);
    }
  }
};

const install = async () => {
  const is_valid = await validateForm();
  if (!is_valid) return;

  const { installExtension } = useInstallExtension();
  if (extension.value) {
    try {
      await installExtension(extension.value.name, true, data.value);
      router.push({ name: 'one-extension' });
      desktop.loadDesktop()
      SuccessAlert('Расширение установлено');
    } catch (e: unknown) {
      FailAlert(`Ошибка установки расширения: ${extractGraphQLErrorMessages(e)}`);
    }
  }
};

const disable = async () => {
  const { updateExtension } = useUpdateExtension();
  if (extension.value) {
    try {
      await updateExtension(extension.value.name, false, extension.value.config);
      // Если расширение отключено, удаляем его workspace
      desktop.removeWorkspace(extension.value.name);

      SuccessAlert('Расширение обновлено');
    } catch (e: unknown) {
      FailAlert(`Ошибка отключения расширения: ${extractGraphQLErrorMessages(e)}`);
    }
  }
};

const enable = async () => {
  const { updateExtension } = useUpdateExtension();
  if (extension.value) {
    try {
      await updateExtension(extension.value.name, true, extension.value.config);

      // Перезагружаем desktop с сервера, чтобы включённое расширение появилось
      await desktop.loadDesktop();

      SuccessAlert('Расширение обновлено');
    } catch (e: any) {
      FailAlert(`Ошибка включения расширения: ${extractGraphQLErrorMessages(e)}`);
    }
  }
};


const uninstall = async () => {
  const { uninstallExtension } = useUninstallExtension();
  if (extension.value) {
    try {
      await uninstallExtension(extension.value.name);
      router.push({ name: 'one-extension' });
      desktop.loadDesktop()
      SuccessAlert('Расширение удалено');
    } catch (e: any) {
      FailAlert(`Ошибка удаления расширения: ${extractGraphQLErrorMessages(e)}`);
    }
  }
};

const isMain = computed(() => route.name == 'one-extension');
const isInstall = computed(() => route.name == 'extension-install');
const isSettings = computed(() => route.name == 'extension-settings');

const isEmpty = computed(() => {
  if (extension.value?.schema)
    return Object.keys(extension.value?.schema.properties).length == 0
  else return false
})
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
