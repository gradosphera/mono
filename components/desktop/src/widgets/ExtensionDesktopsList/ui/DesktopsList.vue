<template lang="pug">
.desktops-list(v-if='desktops && desktops.length > 0')
  q-separator.desktops-list__sep
  .desktops-list__title Рабочие столы
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
.desktops-list__sep {
  margin: var(--p-2, 8px) 0 var(--p-3, 12px);
}
.desktops-list__title {
  font-size: var(--p-fs-meta);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--p-ink-3);
  margin-bottom: var(--p-2, 8px);
}
</style>

