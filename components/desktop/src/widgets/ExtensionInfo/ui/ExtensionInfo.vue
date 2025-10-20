<template lang="pug">
.info-card
  div
    span.text-h1 {{ extension.title }}
      q-chip(
        square
        dense
        size='sm'
        color='green'
        outline
        v-if='extension.is_installed && extension.enabled'
      ).q-ml-sm установлено
      q-chip(
        square
        dense
        size='sm'
        color='orange'
        outline
        v-if='extension.is_installed && !extension.enabled'
      ).q-ml-sm отключено
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
</template>

<script lang="ts" setup>
import { defineAsyncComponent } from 'vue';
import type { IExtension } from 'src/entities/Extension/model/types';
import { ClientOnly } from 'src/shared/ui/ClientOnly';

// Клиентский компонент для markdown, загружаемый только на клиенте
const VueMarkdown = defineAsyncComponent(() =>
  import('vue-markdown-render').then((mod) => mod.default),
);

interface Props {
  extension: IExtension;
}

defineProps<Props>();
</script>
