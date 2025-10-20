<template lang="pug">
.info-card
  q-form(ref='formRef')
    div(v-if='schema && !isEmpty')
      ClientOnly
        template(#default)
          vue-markdown.description.q-mt-md(
            v-if='instructions',
            :source='instructions'
          )
      div
        p.text-h5 Настройки
        ZodForm.q-mt-lg(:schema='schema', :model-value='config', @update:model-value='$emit("update:config", $event)')
    div(v-else)
      .q-pa-md
        p.text-h5 Установка расширения
        p Расширение не требует дополнительной настройки. Нажмите кнопку "включить" для завершения установки и активации расширения.
</template>

<script lang="ts" setup>
import { computed, defineAsyncComponent } from 'vue';
import { ZodForm } from 'src/shared/ui/ZodForm';
import { ClientOnly } from 'src/shared/ui/ClientOnly';

// Клиентский компонент для markdown, загружаемый только на клиенте
const VueMarkdown = defineAsyncComponent(() =>
  import('vue-markdown-render').then((mod) => mod.default),
);

interface Props {
  schema?: any;
  config: any;
  instructions?: string;
  formRef?: any;
}

const props = defineProps<Props>();

const isEmpty = computed(() => {
  if (props.schema)
    return Object.keys(props.schema.properties).length == 0;
  else return false;
});
</script>
