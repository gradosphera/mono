<template lang="pug">
q-item(clickable flat size="sm" @click="showDialog=true").full-width
  div.q-pa-sm
    q-icon(name="fa-regular fa-square-check").q-mr-xs
    span отметить оплаченным

  q-dialog(v-model="showDialog" @hide="close")
    ModalBase(title='отметить оплаченным')
      Form(:handler-submit="setPaid" :is-submitting="isSubmitting" :button-cancel-txt="'Отменить'" :button-submit-txt="'Продолжить'" @cancel="close").q-pa-sm
        div(style="max-width: 300px;")
          p Вы уверены, что хотите отметить счёт оплаченным? Система обработает платеж сразу после получения отметки: совет кооператива получит пакет документов для голосования о приёме нового пайщика, или, паевый взнос будет зачислен в кошелёк.


</template>
<script lang="ts" setup>
import { FailAlert, SuccessAlert } from 'src/shared/api';
import { useSetStatus } from '../../model';
import { ref } from 'vue';
import { ModalBase } from 'src/shared/ui/ModalBase';
import { Form } from 'src/shared/ui/Form';
const {setPaidStatus} = useSetStatus()
const isSubmitting = ref(false)
const showDialog = ref(false)

const emit = defineEmits(['close'])

const props = defineProps({
  id: {
    type: String,
    required: true
  },
})

const close = () => {
  showDialog.value = false
  emit('close')
}

const setPaid = async() => {
  try {
    await setPaidStatus(props.id)
    SuccessAlert('Статус ордера обновлён')
    close()
  } catch(e: any) {
    FailAlert(`Возникла ошибка: ${e.message}`)
    close()
  }
}
</script>
