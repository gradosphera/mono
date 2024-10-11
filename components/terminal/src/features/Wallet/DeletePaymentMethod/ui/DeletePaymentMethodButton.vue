<template lang="pug">
div
  q-btn(@click="showDialog=true" :size="size" flat dense) удалить
    q-icon(name="close")
  q-dialog(v-model="showDialog" @hide="clear")
    ModalBase(:title='"Удалить метод платежа"' )
      Form(:handler-submit="handlerSubmit" :is-submitting="isSubmitting" :button-cancel-txt="'Отменить'" :button-submit-txt="'Продолжить'" @cancel="clear").q-pa-sm
        p Вы уверены, что хотите удалить метод платежа?


  </template>
<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useDeletePaymentMethod } from '../model';
import { FailAlert, SuccessAlert } from 'src/shared/api';
import { ModalBase } from 'src/shared/ui/ModalBase';
import { Form } from 'src/shared/ui/Form';

const props = defineProps({
  username: {
    type: String,
    required: true,
  },
  method_id: {
    type: Number,
    required: true,
  },
  size: {
    type: String,
    required: false,
    default: 'md'
  }
})

const username = computed(() => props.username)

const showDialog = ref(false)
const isSubmitting = ref(false)

const clear = (): void => {
  showDialog.value = false
}

const { deletePaymentMethod } = useDeletePaymentMethod()

const handlerSubmit = async (): Promise<void> => {

  isSubmitting.value = true
  try {
    await deletePaymentMethod({
      username: username.value,
      method_id: props.method_id
    })

    showDialog.value = false
    isSubmitting.value = false
    SuccessAlert('Метод платежа успешно удалён')

  } catch (e: any) {
    showDialog.value = false
    isSubmitting.value = false
    FailAlert(e.message)
  }
}


</script>
