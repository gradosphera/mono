<script setup lang="ts">
const emit = defineEmits(['cancel']);
interface IFormProps {
  handlerSubmit: (e?: Event) => Promise<void>;
  isSubmitting?: boolean;
  showSubmit?: boolean;
  showCancel?: boolean;
  buttonSubmitTxt?: string;
  buttonCancelTxt?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

withDefaults(defineProps<IFormProps>(), {
  isSubmitting: false,
  showCancel: true,
  showSubmit: true,
  buttonSubmitTxt: 'Продолжить',
  buttonCancelTxt: 'Отменить',
  disabled: false,
  size: 'md',
});

const cancel = (): void => {
  emit('cancel');
};
</script>

<template lang="pug">
q-form.q-gutter-sm(@submit.prevent='handlerSubmit')
  template(#default)
    slot
    .flex
      q-btn(v-if='showCancel', flat, @click='cancel', :size='size') {{ buttonCancelTxt }}
      q-btn(
        v-if='showSubmit',
        :size='size',
        type='submit',
        :loading='isSubmitting',
        color='primary',
        :disabled='disabled'
      ) {{ buttonSubmitTxt }}
</template>
