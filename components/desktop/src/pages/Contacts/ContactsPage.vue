<template lang="pug">
.contacts-page
  header.contacts-page__header
    span.contacts-page__eyebrow Контактные данные
    h1.contacts-page__title {{ contacts?.full_name || 'Организация' }}

  .contacts-card
    //- Реквизиты
    section.contacts-card__sec
      .contacts-card__sec-head
        q-icon(name='badge', size='18px')
        span Реквизиты
      dl.contacts-rows
        .contacts-row
          dt.contacts-row__label ИНН
          dd.contacts-row__value {{ displayValue(contacts?.details?.inn) }}
        .contacts-row
          dt.contacts-row__label ОГРН
          dd.contacts-row__value {{ displayValue(contacts?.details?.ogrn) }}

    //- Контакты — canon ContactSheet (копирование, mailto/tel)
    section.contacts-card__sec
      .contacts-card__sec-head
        q-icon(name='contact_page', size='18px')
        span Контакты
      ContactSheet(:contacts='contactItems')

    //- Руководство
    section.contacts-card__sec(v-if='chairman')
      .contacts-card__sec-head
        q-icon(name='person', size='18px')
        span Руководство
      dl.contacts-rows
        .contacts-row
          dt.contacts-row__label Председатель совета
          dd.contacts-row__value {{ chairman }}
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { ContactSheet } from 'src/shared/ui/domain/ContactSheet';
import type { ContactItem } from 'src/shared/ui/domain/ContactSheet';
import { useSystemStore } from 'src/entities/System/model';

const { info } = useSystemStore();

const contacts = computed(() => info.contacts);

const chairman = computed(() => {
  const chair = contacts.value?.chairman;
  if (!chair) {
    return '';
  }
  return [chair.last_name, chair.first_name, chair.middle_name]
    .filter(Boolean)
    .join(' ');
});

// Собираем телефон/почту/адрес в canon ContactSheet (только заполненные).
const contactItems = computed<ContactItem[]>(() => {
  const items: ContactItem[] = [];
  if (contacts.value?.phone) {
    items.push({ type: 'phone', value: contacts.value.phone });
  }
  if (contacts.value?.email) {
    items.push({ type: 'email', value: contacts.value.email });
  }
  if (contacts.value?.full_address) {
    items.push({ type: 'address', value: contacts.value.full_address });
  }
  return items;
});

const displayValue = (value?: string | null) => value || '—';
</script>

<style lang="scss" scoped>
/* Полная ширина, как на canon-страницах документов/платежей. */
.contacts-page {
  padding: var(--p-6, 24px);
}
@media (max-width: 768px) {
  .contacts-page {
    padding: var(--p-4, 16px);
  }
}

.contacts-page__header {
  display: grid;
  gap: var(--p-1, 4px);
  margin-bottom: var(--p-5, 20px);
}
.contacts-page__eyebrow {
  font-size: var(--p-fs-eyebrow, 11px);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--p-ink-3);
}
.contacts-page__title {
  margin: 0;
  font-size: var(--p-fs-h1, 24px);
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--p-ink);
}

/* Единая спокойная поверхность с секциями через hairline. */
.contacts-card {
  display: flex;
  flex-direction: column;
  background: var(--p-surface);
  border: 1px solid var(--p-line);
  border-radius: var(--p-r-lg, 16px);
  overflow: hidden;
}
.contacts-card__sec {
  display: flex;
  flex-direction: column;
  gap: var(--p-3, 12px);
  padding: var(--p-5, 20px);
}
.contacts-card__sec + .contacts-card__sec {
  border-top: 1px solid var(--p-line);
}
.contacts-card__sec-head {
  display: flex;
  align-items: center;
  gap: var(--p-2, 8px);
  color: var(--p-ink-2);
  font-size: var(--p-fs-body-sm, 13px);
  font-weight: 600;
}

/* Тот же ритм, что у ContactSheet: подпись сверху, значение под ней,
   слева, с hairline между строками — единая раскладка по всей карточке. */
.contacts-rows {
  display: flex;
  flex-direction: column;
  margin: 0;
}
.contacts-row {
  display: flex;
  flex-direction: column;
  gap: var(--p-1, 4px);
  padding: var(--p-3, 12px) 0;
  border-bottom: 1px solid var(--p-line);
}
.contacts-row:first-child {
  padding-top: 0;
}
.contacts-row:last-child {
  padding-bottom: 0;
  border-bottom: none;
}
.contacts-row__label {
  font-size: var(--p-fs-meta, 12px);
  color: var(--p-ink-2);
}
.contacts-row__value {
  margin: 0;
  font-size: var(--p-fs-body, 14px);
  font-weight: 500;
  color: var(--p-ink-1);
  overflow-wrap: anywhere;
}
</style>
