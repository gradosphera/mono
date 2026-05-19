<template>
  <BaseForm :loading="loading" :error="formError" @submit="onSubmit">
    <BaseBanner variant="warn" class="ck-form__banner">
      <strong>Не теряйте новый ключ.</strong> Это единственный способ доступа к
      аккаунту — записать его в надёжном месте и не передавать никому.
    </BaseBanner>

    <ul class="ck-form__checklist">
      <li>После смены текущий ключ перестанет работать сразу.</li>
      <li>Восстановить старый ключ нельзя — только сменить ещё раз.</li>
      <li>Новый WIF нужно сохранить вручную до закрытия следующего шага.</li>
    </ul>

    <BaseInput
      v-model="form.currentWif"
      label="Текущий ключ (WIF)"
      :error="errors.currentWif"
      :type="reveal.current ? 'text' : 'password'"
      mono
      autocomplete="current-password"
      name="current-wif"
    >
      <template #append>
        <q-icon
          :name="reveal.current ? 'visibility_off' : 'visibility'"
          class="ck-form__eye"
          @click="reveal.current = !reveal.current"
        />
      </template>
    </BaseInput>

    <BaseInput
      v-model="form.newWif"
      label="Новый ключ (WIF)"
      :error="errors.newWif"
      :type="reveal.next ? 'text' : 'password'"
      mono
      autocomplete="new-password"
      name="new-wif"
    >
      <template #append>
        <q-icon
          :name="reveal.next ? 'visibility_off' : 'visibility'"
          class="ck-form__eye"
          @click="reveal.next = !reveal.next"
        />
        <BaseButton
          variant="ghost"
          size="sm"
          aria-label="Сгенерировать ключ"
          @click="generate"
        >
          <template #icon-left>
            <q-icon name="autorenew" />
          </template>
          Сгенерировать
        </BaseButton>
      </template>
    </BaseInput>

    <BaseInput
      v-model="form.confirmWif"
      label="Подтверждение нового ключа"
      :error="errors.confirmWif"
      type="password"
      mono
      autocomplete="new-password"
      name="confirm-wif"
    />

    <!--
      TODO[E10]: после готовности OtpInput добавить шаг подтверждения
      одноразовым кодом перед on-chain change-key action (UX-DR37, FR11).
      Сейчас бизнес-логика — без OTP, заглушка SDK.
    -->

    <template #footer="{ loading: submitting }">
      <BaseButton
        variant="primary"
        type="submit"
        :loading="submitting"
        :disabled="!isFilled"
        block
      >
        Сменить ключ
      </BaseButton>
    </template>
  </BaseForm>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue';
import type { ChangeKeyFormProps, ChangeKeySubmitPayload } from './ChangeKeyForm.types';

withDefaults(defineProps<ChangeKeyFormProps>(), {
  loading: false,
});

const emit = defineEmits<{
  submit: [payload: ChangeKeySubmitPayload];
  generate: [];
}>();

const form = reactive({
  currentWif: '',
  newWif: '',
  confirmWif: '',
});

const errors = reactive({
  currentWif: '',
  newWif: '',
  confirmWif: '',
});

const reveal = reactive({
  current: false,
  next: false,
});

const formError = computed<string>(() => '');

const isFilled = computed<boolean>(
  () => !!form.currentWif && !!form.newWif && !!form.confirmWif,
);

function validate(): boolean {
  errors.currentWif = '';
  errors.newWif = '';
  errors.confirmWif = '';
  let ok = true;
  if (!form.currentWif) {
    errors.currentWif = 'Введите текущий ключ';
    ok = false;
  }
  if (!form.newWif) {
    errors.newWif = 'Введите новый ключ';
    ok = false;
  } else if (form.newWif === form.currentWif) {
    errors.newWif = 'Новый ключ должен отличаться от текущего';
    ok = false;
  }
  if (form.confirmWif !== form.newWif) {
    errors.confirmWif = 'Подтверждение не совпадает с новым ключом';
    ok = false;
  }
  return ok;
}

function onSubmit(): void {
  if (!validate()) return;
  emit('submit', { currentWif: form.currentWif, newWif: form.newWif });
}

function generate(): void {
  emit('generate');
}

defineExpose({
  /** Внешняя отрисовка сгенерированного WIF в форму (после события generate) */
  applyGeneratedWif(wif: string): void {
    form.newWif = wif;
    form.confirmWif = wif;
    reveal.next = true;
  },
  reset(): void {
    form.currentWif = '';
    form.newWif = '';
    form.confirmWif = '';
    errors.currentWif = '';
    errors.newWif = '';
    errors.confirmWif = '';
    reveal.current = false;
    reveal.next = false;
  },
});
</script>

<style scoped>
.ck-form__banner {
  margin-bottom: var(--p-2, 8px);
}
.ck-form__checklist {
  margin: 0 0 var(--p-2, 8px) 0;
  padding-left: 1.1rem;
  color: var(--p-ink-2);
  font-size: var(--p-fs-body-sm, 14px);
  line-height: 1.45;
}
.ck-form__checklist li + li {
  margin-top: 4px;
}
.ck-form__eye {
  cursor: pointer;
  color: var(--p-ink-3);
  font-size: 18px;
  margin-right: 6px;
}
.ck-form__eye:hover {
  color: var(--p-ink-2);
}
</style>
