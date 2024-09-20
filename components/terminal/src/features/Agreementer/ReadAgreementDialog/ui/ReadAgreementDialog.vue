<template lang="pug">
span(@click.stop='(event) => showDialog(event)' style="color: blue; text-decoration: underline;").q-ml-xs {{text}}
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

const isLoading = computed(() => agreementOnSign.value ? false : true)
const agreementStore = useAgreementStore()
const agreementOnSign = computed(() => agreementStore.generatedAgreements.find(el => el.meta.registry_id == props.agreement.draft_id))
const emit = defineEmits(['update:agree'])

const show = ref(false)
const isSubmitting = ref(false)

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ok = (e?: Event) => {
  emit('update:agree', true)
  show.value = false
}
const clear = () => {
  emit('update:agree', false)
  show.value = false
}

const props = defineProps({
  agreement: {
    type: Object as () => SovietContract.Tables.CoopAgreements.ICoopAgreement,
    required: true,
  },
  agree: {
    type: Boolean,
    required: true,
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
