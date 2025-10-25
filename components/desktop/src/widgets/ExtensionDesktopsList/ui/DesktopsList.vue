<template lang="pug">
.desktops-list(v-if='desktops && desktops.length > 0')
  .q-mt-md
    q-separator.q-mb-sm
    .text-subtitle2.text-grey-7.q-mt-md.q-pl-sm.text-center.q-mb-md Рабочие столы
    q-list(dense)
      q-item(
        v-for='(desktop, index) in desktops',
        :key='desktop.name || index'
      )
        q-item-section(avatar)
          q-avatar(size='md')
            q-icon(:name='desktop.icon || "fa-solid fa-desktop"', size='sm')
        q-item-section
          q-item-label {{ desktop.title || 'Без названия' }}
          //- q-item-label(caption, v-if='desktop.name') {{ desktop.name }}
</template>

<script setup lang="ts">
import type { IDesktopConfig } from 'src/entities/Desktop/model/types'

interface Props {
  desktops?: IDesktopConfig[] | null
}

defineProps<Props>()
</script>

<style scoped lang="scss">
.desktops-list {
  width: 100%;
}
</style>

