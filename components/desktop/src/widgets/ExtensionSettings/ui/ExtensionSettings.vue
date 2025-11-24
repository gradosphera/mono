<template lang="pug">
.settings-container
  q-form(ref='formRef')
    div(v-if='isEmpty')
      .empty-state
        .empty-icon
          q-icon(name="settings" size="3rem" color="grey-4")
        .empty-title.text-h6 Нет настроек
        .empty-description Расширение не предоставило настроек для изменения.

    div(v-if='!isEmpty')
      .settings-header
        .text-h5 Настройки
      ZodForm.q-mt-lg(:schema='schema', :model-value='config', @update:model-value='$emit("update:config", $event)')
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

<style lang="scss" scoped>
.settings-container {
  max-width: 1000px;
  margin: 0 auto;

  .empty-state {
    text-align: center;
    padding: 4rem 2rem;

    .empty-icon {
      margin-bottom: 1.5rem;
      opacity: 0.5;
    }

    .empty-title {
      margin-bottom: 0.5rem;
    }

    .empty-description {
      font-size: 0.9rem;
    }
  }

  .settings-header {
    margin-bottom: 2rem;

    .text-h5 {
      font-weight: 600;
    }
  }
}
</style>
