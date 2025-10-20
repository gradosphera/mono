<template lang="pug">
.info-card
  q-form(ref='formRef')
    div(v-if='isEmpty')
      .q-pa-md
        p.text-h6 Нет настроек
        span Расширение не предоставило настроек для изменения.
    div(v-if='!isEmpty')
      div
        p.text-h5 Настройки
        ZodForm.q-mt-lg(:schema='schema', :model-value='config', @update:model-value='$emit("update:config", $event)')
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { ZodForm } from 'src/shared/ui/ZodForm';

interface Props {
  schema?: any;
  config: any;
  formRef?: any;
}

const props = defineProps<Props>();

const isEmpty = computed(() => {
  if (props.schema)
    return Object.keys(props.schema.properties).length == 0;
  else return false;
});
</script>
