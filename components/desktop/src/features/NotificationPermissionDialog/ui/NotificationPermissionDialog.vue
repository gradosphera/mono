<template lang="pug">
q-dialog(
  v-model='isDialogVisible',
  persistent,
  no-esc-dismiss,
  no-backdrop-dismiss,
  transition-show='fade',
  transition-hide='fade'
)
  q-card.notification-permission-dialog
    q-card-section.text-center.q-pa-xl
      .dialog-icon.q-mb-lg
        q-icon(name='notifications', size='4rem', color='primary')

      .dialog-title.text-h4.q-mb-md
        | Разрешить уведомления?

      .dialog-description.text-body1.q-mb-xl
        p Мы хотели бы присылать вам важные уведомления о событиях в кооперативе:
        ul.q-pl-md
          li Статус ваших заявок и документов
          li Важные объявления
          li Уведомления о собраниях
          li И прочее...

        p.q-mt-md
          | Вы сможете настроить типы уведомлений или отключить их в любое время.

    q-card-actions.q-pa-xl.justify-center
      .dialog-actions
        q-btn.q-mr-md(
          @click='handleDeny',
          flat,
          color='grey-7',
          size='lg',
          :disable='isProcessing'
        ) Не сейчас

        q-btn(
          @click='handleAllow',
          color='primary',
          size='lg',
          :loading='isProcessing',
          :disable='isProcessing'
        ) Разрешить уведомления
</template>

<script setup lang="ts">
import { useNotificationPermissionDialog } from '../model';

const { isDialogVisible, isProcessing, handleAllow, handleDeny } =
  useNotificationPermissionDialog();
</script>

<style lang="scss" scoped>
.notification-permission-dialog {
  max-width: 600px;
  margin: 0 auto;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);

  .dialog-icon {
    .q-icon {
      background: rgba(var(--q-primary-rgb), 0.1);
      border-radius: 50%;
      padding: 20px;
    }
  }

  .dialog-title {
    font-weight: 600;
    color: var(--q-dark);
  }

  .dialog-description {
    color: var(--q-dark);
    line-height: 1.6;
    max-width: 500px;
    margin: 0 auto;

    ul {
      text-align: left;

      li {
        margin-bottom: 8px;
      }
    }
  }

  .dialog-actions {
    display: flex;
    gap: 16px;

    .q-btn {
      min-width: 160px;
    }
  }
}

// Для мобильных устройств
@media (max-width: 600px) {
  .notification-permission-dialog {
    margin: 20px;

    .q-card-section {
      padding: 24px !important;
    }

    .q-card-actions {
      padding: 24px !important;
    }

    .dialog-actions {
      flex-direction: column;

      .q-btn {
        width: 100%;
      }
    }
  }
}
</style>
