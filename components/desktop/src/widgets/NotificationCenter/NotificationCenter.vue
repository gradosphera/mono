<template lang="pug">
.notification-bell
  button.icon-btn(type='button', aria-label='Уведомления')
    q-icon(name='notifications')
    BaseBadge.notification-bell__count(
      v-if='store.unreadCount',
      variant='accent'
    ) {{ badgeLabel }}
    q-menu(
      anchor='bottom right',
      self='top right',
      :offset='[0, 8]',
      @show='onOpen'
    )
      NotificationPanel(
        :notifications='store.items',
        :loading='store.loading',
        :view-all-label='viewAllLabel',
        @open='onOpenNotification',
        @mark-all-read='onMarkAllRead',
        @view-all='onViewAll'
      )
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount } from 'vue';
import { BaseBadge } from 'src/shared/ui/base/BaseBadge';
import { NotificationCenter as NotificationPanel } from 'src/shared/ui/domain/NotificationCenter';
import { useNotificationInboxStore } from './model';

const store = useNotificationInboxStore();

const badgeLabel = computed(() => (store.unreadCount > 99 ? '99+' : String(store.unreadCount)));
const viewAllLabel = computed(() => (store.hasMore ? 'Показать ещё' : 'Все загружены'));

function onOpen(): void {
  void store.loadInbox(true);
}

function onOpenNotification(id: string): void {
  void store.markRead(id);
}

function onMarkAllRead(): void {
  void store.markAllRead();
}

function onViewAll(): void {
  void store.loadMore();
}

onMounted(() => {
  if (process.env.CLIENT) store.startPolling();
});

onBeforeUnmount(() => {
  store.stopPolling();
});
</script>

<style scoped>
.notification-bell {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.notification-bell__count {
  position: absolute;
  top: 2px;
  right: 2px;
  pointer-events: none;
}
</style>
