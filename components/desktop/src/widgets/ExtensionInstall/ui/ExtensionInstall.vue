<template lang="pug">
.info-card
  q-form(ref='formRef')
    div(v-if='schema && !isEmpty')
      div
        p.text-h5 Настройки
        ZodForm.q-mt-lg(:schema='schema', :model-value='config', :install-mode='true', @update:model-value='$emit("update:config", $event)')
    div(v-else)
      .q-pa-md
        p.text-h5 Установка расширения
        p Расширение не требует дополнительной настройки. Нажмите кнопку "включить" для завершения установки и активации расширения.
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { ZodForm } from 'src/shared/ui/ZodForm';
import { isExtensionSchemaEmpty } from 'src/shared/lib/utils';

interface Props {
  schema?: any;
  config: any;
  formRef?: any;
}

const props = defineProps<Props>();

const isEmpty = computed(() => isExtensionSchemaEmpty(props.schema));
</script>
