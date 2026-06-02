<template lang="pug">
.epic9-hint
  q-banner.bg-info.text-white.q-mb-md(rounded)
    template(#avatar)
      q-icon(name='fa-solid fa-rocket')
    | Epic 9 — магазин приложений. Bundle-расширения ниже — нативные,
    | оплачивать не нужно. Раздел «Удалённые пакеты» — V1 demo: реальная
    | подписка появится после 9.3.b/9.5.b (стол разработчика + backend
    | резолверы).

section.catalog-section
  h3.catalog-section__title Нативные расширения
  .catalog-grid
    ExtensionCard(
      v-for='extension in filteredExtensions',
      :key='extension.name',
      :extension='extension'
    )

section.catalog-section.catalog-section--remote
  .catalog-section__head
    h3.catalog-section__title Удалённые пакеты
    span.catalog-section__hint Каталог apps-catalog (1000 ₽/мес)
  .catalog-grid
    article.remote-card(
      v-for='pkg in remoteExtensions',
      :key='pkg.packageId'
    )
      .remote-card__head
        q-avatar(size='48px', color='deep-orange-1', text-color='deep-orange-10')
          q-icon(name='fa-solid fa-cube' size='22px')
        .remote-card__heading
          h3.remote-card__title {{ pkg.title }}
          span.badge.badge--info
            q-icon(name='fa-solid fa-cloud-arrow-down' size='11px')
            | Удалённый
      p.remote-card__desc {{ pkg.description }}
      .remote-card__meta
        span.remote-card__publisher
          q-icon(name='fa-solid fa-building' size='12px')
          | {{ pkg.publisher }}
        span.remote-card__price {{ pkg.rubPerMonth }} ₽/мес
      .remote-card__foot
        q-btn.remote-card__btn(
          unelevated,
          color='primary',
          label='Подписаться',
          icon='fa-solid fa-plus',
          size='sm',
          @click='openSubscribe(pkg)'
        )

q-dialog(v-model='subscribeDialog')
  q-card.subscribe-dialog
    q-card-section
      .text-h6 Подписка на {{ pendingPkg?.title || 'пакет' }}
    q-card-section.q-pt-none
      p Стоимость: {{ pendingPkg?.rubPerMonth }} ₽/мес. Период оплаты определяется
        | globals.min_payment_period_seconds.
      p.text-caption.q-mb-none
        | V1 demo: реальная подписка через mutation appsCatalogSubscribe +
        | on-chain `apps::subscribe` — отложена в 9.5.b (см. PR mono#64).
    q-card-actions(align='right')
      q-btn(flat, label='Закрыть', v-close-popup)
</template>

<script lang="ts" setup>
import { useExtensionStore } from 'src/entities/Extension/model';
import { useSystemStore } from 'src/entities/System/model';
import { onMounted, computed, ref } from 'vue';
import { ExtensionCard } from 'src/widgets/ExtensionCard';

interface RemotePackage {
  packageId: string;
  title: string;
  description: string;
  publisher: string;
  rubPerMonth: number;
}

const extStore = useExtensionStore();
const systemStore = useSystemStore();

const filteredExtensions = computed(() => {
  return extStore.extensions.filter(
    (extension) => extension.name !== 'capital' || systemStore.info.coopname === 'voskhod',
  );
});

// 9.5.a — статический моковый список удалённых пакетов из apps-catalog.
// В 9.5.b заменится на Query.appsCatalogRemotePackages(coopname) через
// SDK (см. mono#64 follow-ups). Coopname здесь нужен будет на reseller
// фильтр + self-sub bypass (Epic 9.6).
const remoteExtensions = ref<RemotePackage[]>([
  {
    packageId: '@voskhod/demoapp',
    title: 'Demo App',
    description: 'Hello-стол — эталонный пример удалённого расширения от каталога apps-catalog. Публикуется voskhod, доступен по подписке.',
    publisher: 'voskhod',
    rubPerMonth: 1000,
  },
]);

const subscribeDialog = ref(false);
const pendingPkg = ref<RemotePackage | null>(null);

function openSubscribe(pkg: RemotePackage) {
  pendingPkg.value = pkg;
  subscribeDialog.value = true;
}

onMounted(async () => {
  extStore.loadExtensions();
});
</script>

<style scoped lang="scss">
.catalog-section {
  margin-bottom: var(--p-6, 24px);
}

.catalog-section__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--p-3, 12px);
  margin-bottom: var(--p-3, 12px);
}

.catalog-section__title {
  margin: 0 0 var(--p-3, 12px);
  font-size: var(--p-fs-h3);
  font-weight: 600;
  color: var(--p-ink);
}

.catalog-section__hint {
  font-size: var(--p-fs-body-sm);
  color: var(--p-ink-2);
}

.catalog-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: var(--p-4, 16px);
}

.remote-card {
  display: flex;
  flex-direction: column;
  gap: var(--p-3, 12px);
  padding: var(--p-5, 20px);
  background: var(--p-surface, #fff);
  border: 1px solid var(--p-line);
  border-radius: var(--p-r-lg, 14px);
  min-height: 200px;
}

.remote-card__head {
  display: flex;
  align-items: flex-start;
  gap: var(--p-3, 12px);
}

.remote-card__heading {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--p-1, 4px);
}

.remote-card__title {
  margin: 0;
  font-size: var(--p-fs-h3);
  font-weight: 600;
  color: var(--p-ink);
  line-height: 1.3;
}

.remote-card__desc {
  margin: 0;
  font-size: var(--p-fs-body-sm);
  line-height: 1.5;
  color: var(--p-ink-2);
}

.remote-card__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  font-size: var(--p-fs-body-sm);
  color: var(--p-ink-2);
}

.remote-card__publisher {
  display: inline-flex;
  align-items: center;
  gap: var(--p-1, 4px);
}

.remote-card__price {
  font-weight: 600;
  color: var(--p-ink);
}

.remote-card__foot {
  display: flex;
  justify-content: flex-end;
}

.subscribe-dialog {
  min-width: 360px;
}
</style>
