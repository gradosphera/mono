<template lang="pug">
.membership-exit-page
  AuthCard(:max-width='480')
    //- Шапка: иконка-предупреждение + заголовок + краткое пояснение.
    template(#head)
      .exit-intro__icon
        q-icon(name='logout', size='28px')
      h2.exit-intro__title Добровольный выход из кооператива
      p.exit-intro__text
        | Выход производится по вашему заявлению. После одобрения Советом аккаунт
        | блокируется, а паевой взнос возвращается в срок, установленный Уставом
        | кооператива.

    //- Тело: ключевые шаги/условия процедуры.
    ul.exit-intro__points
      li
        q-icon(name='description', size='18px')
        span Заявление формируется автоматически — вы прочитаете и подпишете его.
      li
        q-icon(name='mark_email_unread', size='18px')
        span Запуск процедуры подтверждается по ссылке из письма.
      li
        q-icon(name='payments', size='18px')
        span Возврат паевого взноса поступит по вашим реквизитам.
      li
        q-icon(name='block', size='18px')
        span Возврат к участию после выхода невозможен — потребуется новая регистрация.

    //- Футер: запуск подачи заявления.
    template(#footer)
      ExitButton
</template>

<script setup lang="ts">
import { AuthCard } from 'src/shared/ui/domain/AuthCard';
import { ExitButton } from 'src/features/Membership/ExitFromCoop';
</script>

<style scoped lang="scss">
.membership-exit-page {
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--p-6);
}

.exit-intro__icon {
  width: 56px;
  height: 56px;
  border-radius: var(--p-r-lg);
  display: grid;
  place-items: center;
  margin: 0 auto var(--p-3);
  background: var(--p-warn-soft);
  color: var(--p-warn);
}

.exit-intro__title {
  margin: 0;
  font-size: var(--p-fs-h2);
  line-height: var(--p-lh-h2);
  letter-spacing: var(--p-ls-h2);
  font-weight: 600;
  color: var(--p-ink);
}
.exit-intro__text {
  margin: var(--p-2) 0 0;
  font-size: var(--p-fs-body-sm);
  line-height: var(--p-lh-body-sm);
  color: var(--p-ink-2);
}

.exit-intro__points {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--p-3);
}
.exit-intro__points li {
  display: flex;
  align-items: flex-start;
  gap: var(--p-2);
  font-size: var(--p-fs-body-sm);
  line-height: var(--p-lh-body-sm);
  color: var(--p-ink-2);
}
.exit-intro__points li .q-icon {
  flex-shrink: 0;
  margin-top: 1px;
  color: var(--p-ink-3);
}

@media (max-width: 768px) {
  .membership-exit-page {
    padding: var(--p-4);
  }
}
</style>
