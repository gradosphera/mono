<template>
  <BaseDialog
    :model-value="modelValue"
    title="Ключ обновлён"
    :close-on-backdrop="false"
    :close-on-escape="false"
    :hide-close-button="true"
    size="md"
    @update:model-value="onUpdate"
  >
    <p class="ck-success__lead">
      Новый ключ создан и активирован on-chain. Старый ключ перестал работать.
      Сохраните WIF ниже — он показывается только сейчас и не хранится на стороне платформы.
    </p>

    <div class="ck-success__wif" :class="{ 'ck-success__wif--copied': copied }">
      <span class="ck-success__wif-val">{{ newWif }}</span>
      <BaseButton
        variant="ghost"
        size="sm"
        :aria-label="copied ? 'Скопировано' : 'Скопировать ключ'"
        @click="copy"
      >
        <template #icon-left>
          <q-icon :name="copied ? 'check' : 'content_copy'" />
        </template>
        {{ copied ? 'Скопировано' : 'Копировать' }}
      </BaseButton>
    </div>

    <p class="ck-success__hint">
      Запишите ключ в менеджер паролей или на бумаге. Без него аккаунт нельзя восстановить.
    </p>

    <BaseBanner v-if="confirmingClose" variant="warn" class="ck-success__guard">
      Подтвердите, что вы сохранили ключ. Закрыть окно можно только кнопкой ниже.
    </BaseBanner>

    <template #footer>
      <BaseButton
        variant="primary"
        :disabled="!copied && !confirmingClose"
        block
        @click="onConfirm"
      >
        Я сохранил ключ
      </BaseButton>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { copyToClipboard, Notify } from 'quasar';
import type { ChangeKeySuccessDialogProps } from './ChangeKeySuccessDialog.types';

const props = defineProps<ChangeKeySuccessDialogProps>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  confirmed: [];
}>();

const copied = ref(false);
const confirmingClose = ref(false);

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      copied.value = false;
      confirmingClose.value = false;
    }
  },
);

async function copy(): Promise<void> {
  try {
    await copyToClipboard(props.newWif);
    copied.value = true;
    Notify.create({
      message: 'Ключ скопирован',
      type: 'positive',
      position: 'top',
      timeout: 1500,
    });
  } catch {
    Notify.create({
      message: 'Не удалось скопировать. Перенесите ключ вручную.',
      type: 'negative',
      position: 'top',
    });
  }
}

function onConfirm(): void {
  if (!copied.value && !confirmingClose.value) {
    confirmingClose.value = true;
    return;
  }
  emit('confirmed');
  emit('update:modelValue', false);
}

function onUpdate(): void {
  // BaseDialog уже передаёт persistent=true (close-on-backdrop=false +
  // close-on-escape=false). Сюда попадаем только если что-то намеренно
  // вызывает emit — показываем guard вместо немедленного закрытия.
  confirmingClose.value = true;
}
</script>

<style scoped>
.ck-success__lead {
  margin: 0 0 var(--p-3, 12px) 0;
  color: var(--p-ink-2);
  font-size: var(--p-fs-body);
  line-height: 1.5;
}
.ck-success__wif {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--p-2, 8px);
  padding: 10px 12px;
  margin-bottom: var(--p-2, 8px);
  background: var(--p-surface-2);
  border: 1px solid var(--p-line-1);
  border-radius: var(--p-r-sm, 8px);
}
.ck-success__wif--copied {
  border-color: var(--p-primary);
  background: var(--p-primary-soft);
}
.ck-success__wif-val {
  font-family: var(--p-mono);
  font-size: var(--p-fs-mono, 13px);
  color: var(--p-ink);
  word-break: break-all;
  line-height: 1.4;
  flex: 1 1 auto;
  user-select: all;
}
.ck-success__hint {
  margin: 0 0 var(--p-3, 12px) 0;
  font-size: var(--p-fs-body-sm, 13px);
  color: var(--p-ink-3);
  line-height: 1.45;
}
.ck-success__guard {
  margin-top: var(--p-2, 8px);
}
</style>
