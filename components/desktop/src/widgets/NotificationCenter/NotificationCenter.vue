<template lang="pug">
.notification-bell
  button.icon-btn(type='button', aria-label='Уведомления')
    q-icon(name='notifications')
    BaseBadge.notification-bell__count(
      v-if='store.unreadCount',
      variant='accent'
    ) {{ badgeLabel }}
    q-menu(
      ref='menuRef',
      anchor='bottom right',
      self='top right',
      :offset='[0, 8]',
      @show='onOpen'
    )
      NotificationPanel(
        :notifications='store.items',
        :loading='store.loading',
        :view-all-label="'Показать все'",
        :show-view-all='isChairman',
        @open='onOpenNotification',
        @mark-all-read='onMarkAllRead',
        @view-all='onViewAll'
      )
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount } from 'vue';
import type { QMenu } from 'quasar';
import { useRouter } from 'vue-router';
import { BaseBadge } from 'src/shared/ui/base/BaseBadge';
import { NotificationCenter as NotificationPanel } from 'src/shared/ui/domain/NotificationCenter';
import { useSessionStore } from 'src/entities/Session';
import { useSystemStore } from 'src/entities/System/model';
import { useNotificationInboxStore } from './model';

const store = useNotificationInboxStore();
const session = useSessionStore();
const { info } = useSystemStore();
const router = useRouter();
const menuRef = ref<QMenu | null>(null);

const badgeLabel = computed(() => (store.unreadCount > 99 ? '99+' : String(store.unreadCount)));
// Футер «Показать все» ведёт в полный журнал — он на столе председателя
// (роль chairman). Для остальных пайщиков полной страницы пока нет — футер скрыт.
const isChairman = computed(() => session.isChairman);

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
  menuRef.value?.hide();
  void router.push({
    name: 'chairman-notifications-journal',
    params: { coopname: info.coopname },
  });
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
  top: -4px;
  right: -4px;
  pointer-events: none;
}
</style>
