<template lang="pug">
span.agreement-link(@click.stop='(event) => showDialog(event)').q-ml-xs {{text}}
  q-dialog(v-model="show" persistent :maximized="true" )
    ModalBase(title="" :show_close="true")
      div.row.justify-center
        div(style="padding-bottom: 100px;").col-md-8.col-col-xs-12
          Loader(v-if="isLoading" :text='`Загружаем документ...`')
          Form(:handler-submit="ok" :is-submitting="isSubmitting" :showSubmit="!isLoading" :showCancel="!isLoading" button-cancel-text="Отменить" button-submit-txt="Подтвердить" @cancel="clear").q-pa-md
            slot

</template>
<script setup lang="ts">
import { computed, ref } from 'vue';
import { ModalBase } from 'src/shared/ui/ModalBase';
import { Loader } from 'src/shared/ui/Loader';
import { Form } from 'src/shared/ui/Form';
import { SovietContract } from 'cooptypes';
import { useAgreementStore } from 'src/entities/Agreement';

// Если agreement передан, проверяем загрузку из store
// Если нет - считаем что контент передан через slot
const agreementStore = useAgreementStore()
const agreementOnSign = computed(() => {
  if (!props.agreement) return true; // Контент передан через slot
  return agreementStore.generatedAgreements.find(el => el.meta.registry_id == props.agreement?.draft_id)
})
const isLoading = computed(() => agreementOnSign.value ? false : true)
const emit = defineEmits(['update:agree'])

const show = ref(false)
const isSubmitting = ref(false)

const ok = async() => {
  emit('update:agree', true)
  show.value = false
}
const clear = () => {
  emit('update:agree', false)
  show.value = false
}

const props = defineProps({
  agreement: {
    type: Object as () => SovietContract.Tables.CoopAgreements.ICoopAgreement | undefined,
    required: false,
    default: undefined,
  },
  agree: {
    type: Boolean,
    required: false,
    default: false,
  },
  text: {
    type: String,
    required: true
  }
})

const showDialog = (event) => {
  event.stopPropagation()
  console.log('props: ', props)
  show.value = true
}

</script>
