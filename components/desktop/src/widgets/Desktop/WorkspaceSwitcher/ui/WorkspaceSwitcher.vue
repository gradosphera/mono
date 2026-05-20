<template lang="pug">
button.ws-switcher(
  type='button',
  :aria-haspopup='workspaces.length > 1 ? "menu" : undefined',
  :aria-disabled='workspaces.length <= 1',
  :disabled='workspaces.length <= 1'
)
  span.ws-switcher__icon
    span.ws-switcher__icon-svg(v-html='logoSvg')
  .ws-switcher__text
    span.ws-switcher__caption {{ coopShortName }}
    span.ws-switcher__title {{ currentTitle }}
  q-icon.ws-switcher__chevron(v-if='workspaces.length > 1', name='expand_more', size='18px')

  q-menu(
    v-if='workspaces.length > 1',
    anchor='bottom left',
    self='top left',
    :offset='[0, 4]',
    class='ws-switcher__menu'
  )
    q-list(dense)
      q-item(
        v-for='ws in workspaces',
        :key='ws.workspaceName',
        clickable,
        v-close-popup,
        :active='ws.workspaceName === activeWorkspaceName',
        @click='onSelect(ws.workspaceName)'
      )
        q-item-section(avatar)
          q-icon(:name='ws.icon || "fa-solid fa-desktop"', size='18px')
        q-item-section
          q-item-label {{ ws.title }}
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useDesktopStore } from 'src/entities/Desktop/model';
import { useSystemStore } from 'src/entities/System/model';
import logoSvg from 'src/assets/logo.svg?raw';

const router = useRouter();
const desktop = useDesktopStore();
const system = useSystemStore();

const workspaces = computed(() => desktop.workspaceMenus);
const activeWorkspaceName = computed(() => desktop.activeWorkspaceName);

const coopShortName = computed<string>(
  () =>
    system.info.vars?.short_abbr ||
    system.info.coopname ||
    'Кооператив',
);

const currentTitle = computed<string>(() => {
  const active = workspaces.value.find(
    (ws) => ws.workspaceName === activeWorkspaceName.value,
  );
  return active?.title || 'Рабочий стол';
});

function onSelect(name: string): void {
  if (name === activeWorkspaceName.value) return;
  desktop.selectWorkspace(name);
  desktop.goToDefaultPage(router);
}
</script>

<style scoped>
.ws-switcher {
  display: flex;
  align-items: center;
  gap: var(--p-2, 8px);
  width: 100%;
  padding: var(--p-2, 8px);
  margin: 0;
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--p-radius-md, 8px);
  color: var(--p-ink);
  cursor: pointer;
  text-align: left;
  font: inherit;
  transition: background-color 0.15s ease, border-color 0.15s ease;
}
.ws-switcher:hover:not(:disabled) {
  background: var(--p-surface);
  border-color: var(--p-line);
}
.ws-switcher:disabled {
  cursor: default;
}

.ws-switcher__icon {
  flex: 0 0 32px;
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--p-primary-soft, rgba(13, 148, 136, 0.12));
  color: var(--p-primary);
  border-radius: var(--p-radius-md, 8px);
}
.ws-switcher__icon-svg {
  display: inline-flex;
  width: 18px;
  height: 18px;
  line-height: 0;
}
.ws-switcher__icon-svg :deep(svg) {
  width: 100%;
  height: 100%;
}

.ws-switcher__text {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}
.ws-switcher__caption {
  font-size: var(--p-fs-caption, 11px);
  line-height: 1.2;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--p-ink-2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ws-switcher__title {
  font-size: var(--p-fs-body, 14px);
  line-height: 1.3;
  font-weight: 600;
  color: var(--p-ink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ws-switcher__chevron {
  flex: 0 0 18px;
  color: var(--p-ink-3, var(--p-ink-2));
}

.ws-switcher__menu :deep(.q-list) {
  min-width: 220px;
  padding: var(--p-1, 4px);
}
</style>
