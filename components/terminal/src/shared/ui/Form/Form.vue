<script setup lang="ts">
const emit = defineEmits(['cancel'])
interface IFormProps {
  handlerSubmit: (e?: Event) => Promise<void>
  isSubmitting?: boolean
  showCancel?: boolean
  buttonSubmitTxt?: string
  buttonCancelTxt?: string
}

withDefaults(defineProps<IFormProps>(), {
  isSubmitting: false,
  showCancel: true,
  buttonSubmitTxt: 'Продолжить',
  buttonCancelTxt: 'Отменить',
})

const cancel = (): void => {
  emit('cancel')
}
</script>

<template lang="pug">
q-form(@submit.prevent="handlerSubmit")
  template(#default)
    slot
    div.flex.q-mt-md
      q-btn(v-if="showCancel" flat @click="cancel") {{ buttonCancelTxt }}
      q-btn(:class="{'full-width': !showCancel}" type="submit" :loading="isSubmitting" color="primary") {{ buttonSubmitTxt }}

</template>
