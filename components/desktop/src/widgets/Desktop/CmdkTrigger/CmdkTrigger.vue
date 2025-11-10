<template lang="pug">
q-btn.cmdk-trigger(
  flat,
  dense,
  stack,
  @click="openCmdkDialog"
  :class="{ 'active': cmdkStore.activeWorkspaceIcon !== 'fa-solid fa-desktop' }"
)
  .trigger-content
    q-icon.trigger-icon(:name="cmdkStore.activeWorkspaceIcon")
    .trigger-text {{ cmdkStore.activeWorkspaceTitle }}
  .cmdk-shortcut(v-if="cmdkStore.shortcutHint") {{ cmdkStore.shortcutHint }}

</template>

<script setup lang="ts">
import { useCmdkMenuStore } from 'src/entities/CmdkMenu/model';

const cmdkStore = useCmdkMenuStore();

const openCmdkDialog = () => {
  cmdkStore.openDialog();
};
</script>

<style lang="scss">
.cmdk-trigger {
  width: 100%;
  height: 100px;
  border-radius: 0 !important;
  background: transparent;
  border: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  align-items: center;
  justify-content: center;

  &:hover {
    background: rgba(0, 105, 92, 0.04);
  }

  &.active {
    background: rgba(0, 105, 92, 0.04);
  }

  .trigger-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .trigger-icon {
    font-size: 20px;
    color: #00695c;
  }

  .trigger-text {
    font-size: 10px;
    font-weight: 500;
    color: #424242;
    text-align: center;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .cmdk-shortcut {
    position: absolute;
    top: 4px;
    right: 4px;
    font-size: 8px;
    color: #999;
    font-weight: 500;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    line-height: 1;
    padding: 1px 3px;
    border-radius: 3px;
    pointer-events: none;
  }
}
</style>
