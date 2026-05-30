<template lang="pug">
//- Баннер «реестр сведён к одному найденному документу» с кнопкой возврата
//- к полному списку. Появляется, когда страница открыта по ссылке из поиска.
BaseBanner.searched-document-banner(variant='info')
  template(#icon)
    q-icon(name='search' size='20px')
  span Показан один документ, выбранный в поиске.
  template(#action)
    BaseButton(variant='ghost' size='sm' @click='$emit("clear")') Показать все документы
</template>

<script setup lang="ts">
import { BaseBanner } from 'src/shared/ui/base/BaseBanner';
import { BaseButton } from 'src/shared/ui/base/BaseButton';

defineEmits<{ (e: 'clear'): void }>();
</script>

<style lang="scss" scoped>
.searched-document-banner {
  margin-bottom: var(--p-4, 16px);
}
</style>
