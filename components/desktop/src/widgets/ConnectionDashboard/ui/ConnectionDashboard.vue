<template lang="pug">
div.connection-dashboard
  //- Заголовок с поздравлением
  .text-center.q-pa-lg.q-mb-lg
    q-icon(name="celebration" color="positive" size="64px").q-mb-md
    .text-h5.q-mb-sm Подключение активно
    .text-body1.text-grey-7 Ваш кооператив успешно развернут на платформе

  //- Основная информация
  .row.q-col-gutter-lg.q-mb-lg
    //- Карточка домена
    .col-12.col-md-6
      q-card(flat).full-height.bg-grey-1
        q-card-section.q-pa-lg
          .flex.items-center.q-mb-md
            q-icon(name="domain" color="primary" size="32px").q-mr-md
            .text-subtitle1.text-weight-medium Домен

          .text-h6.text-primary.q-mb-sm {{ instance?.domain || '—' }}

          .row.q-mt-md
            .col-6
              .text-caption.text-grey-7 Статус
              .text-body2.text-weight-medium
                q-chip(color="positive" text-color="white" size="sm") Активен
            .col-6
              .text-caption.text-grey-7 Делегирование
              .text-body2.text-weight-medium
                q-chip(
                  :color="instance?.is_delegated ? 'positive' : 'grey'"
                  text-color="white"
                  size="sm"
                ) {{ instance?.is_delegated ? 'Настроено' : 'Не настроено' }}

    //- Карточка блокчейн-статуса
    .col-12.col-md-6
      q-card(flat).full-height.bg-grey-1
        q-card-section.q-pa-lg
          .flex.items-center.q-mb-md
            q-icon(name="link" color="primary" size="32px").q-mr-md
            .text-subtitle1.text-weight-medium Блокчейн

          .text-h6.q-mb-sm {{ getBlockchainStatusLabel }}

          .row.q-mt-md
            .col-6
              .text-caption.text-grey-7 Статус членства
              .text-body2.text-weight-medium
                q-chip(
                  :color="getBlockchainStatusColor"
                  text-color="white"
                  size="sm"
                ) {{ instance?.blockchain_status || '—' }}
            .col-6
              .text-caption.text-grey-7 Установка
              .text-body2.text-weight-medium {{ instance?.progress || 0 }}%

  //- Дополнительные карточки (заглушки)
  .row.q-col-gutter-lg
    //- Карточка подписок (заглушка)
    .col-12.col-md-4
      q-card(flat).full-height.bg-grey-1
        q-card-section.q-pa-lg
          .flex.items-center.q-mb-md
            q-icon(name="subscriptions" color="primary" size="28px").q-mr-sm
            .text-subtitle2.text-weight-medium Подписки

          .text-body2.text-grey-7.q-mb-md
            | Управление активными подписками на услуги платформы

          q-btn(
            flat
            color="primary"
            label="Скоро"
            disable
            size="sm"
          )

    //- Карточка баланса AXON (заглушка)
    .col-12.col-md-4
      q-card(flat).full-height.bg-grey-1
        q-card-section.q-pa-lg
          .flex.items-center.q-mb-md
            q-icon(name="account_balance_wallet" color="primary" size="28px").q-mr-sm
            .text-subtitle2.text-weight-medium Кошелек AXON

          .text-body2.text-grey-7.q-mb-md
            | Баланс токенов для оплаты услуг платформы

          q-btn(
            flat
            color="primary"
            label="Скоро"
            disable
            size="sm"
          )

    //- Карточка настроек (заглушка)
    .col-12.col-md-4
      q-card(flat).full-height.bg-grey-1
        q-card-section.q-pa-lg
          .flex.items-center.q-mb-md
            q-icon(name="settings" color="primary" size="28px").q-mr-sm
            .text-subtitle2.text-weight-medium Настройки

          .text-body2.text-grey-7.q-mb-md
            | Параметры подключения и конфигурация платформы

          q-btn(
            flat
            color="primary"
            label="Скоро"
            disable
            size="sm"
          )

  //- Информация о платформе
  .q-mt-xl
    q-card(flat).bg-grey-1
      q-card-section.q-pa-lg
        .text-subtitle2.q-mb-md.text-weight-medium О платформе
        .text-body2.text-grey-8
          | Платформа кооперативной экономики предоставляет цифровые инструменты для управления кооперативом,
          | учета деятельности членов, проведения собраний, голосований и других операций в соответствии
          | с законодательством о кооперации.
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useConnectionAgreementStore } from 'src/entities/ConnectionAgreement'

const connectionAgreement = useConnectionAgreementStore()

// Получаем instance напрямую из store
const instance = computed(() => connectionAgreement.currentInstance)

// Цвет статуса блокчейна
const getBlockchainStatusColor = computed(() => {
  if (instance.value?.blockchain_status === 'active') return 'positive'
  if (instance.value?.blockchain_status === 'pending') return 'warning'
  if (instance.value?.blockchain_status === 'blocked') return 'negative'
  return 'grey'
})

// Метка статуса блокчейна
const getBlockchainStatusLabel = computed(() => {
  if (instance.value?.blockchain_status === 'active') return 'Подключен к блокчейну'
  if (instance.value?.blockchain_status === 'pending') return 'Ожидание подключения'
  if (instance.value?.blockchain_status === 'blocked') return 'Заблокирован'
  return 'Неизвестно'
})
</script>

<style lang="scss" scoped>
.connection-dashboard {
  max-width: 1200px;
  margin: 0 auto;
}
</style>

