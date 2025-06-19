<script setup lang="ts">
import { useCooperativeStore } from 'src/entities/Cooperative';
import { useSessionStore } from 'src/entities/Session';
import { useCreateFund } from 'src/features/Fund/CreateFund';
import { FailAlert, SuccessAlert } from 'src/shared/api';
import { useSystemStore } from 'src/entities/System/model';
const { info } = useSystemStore()

import { ref, watch } from 'vue';

const props = defineProps({
  showAdd: {
    type: Boolean,
    required: true,
  }
})

const emit = defineEmits(['close'])
const coop = useCooperativeStore()
const { createFund } = useCreateFund()
const session = useSessionStore()


const localShowAdd = ref(false)
const name = ref('')
const description = ref('')
const percent = ref()

const addFund = async() => {
  try{
    await createFund({
      coopname: info.coopname,
      username: session.username,
      type: 'accumulation',
      contract: '',
      name: name.value,
      description: description.value,
      percent: Number(percent.value) * 10000
    })

    await coop.loadFunds(info.coopname)
    localShowAdd.value = false
    name.value = ''
    description.value = ''
    percent.value = ''

    SuccessAlert('Фонд успешно создан')
  } catch(e: any){
    localShowAdd.value = false
    FailAlert(e)
  }

}

watch(() => props.showAdd, (newValue: boolean) => {
  localShowAdd.value = newValue
})

watch(localShowAdd, (newValue) => {
  if (newValue === false)
    emit('close')
})
</script>

<template lang="pug">
q-dialog(v-model="localShowAdd" persistent :maximized="false" )
  q-card
    div()
      q-bar.bg-gradient-dark.text-white
        span Добавить фонд накопления
        q-space
        q-btn(v-close-popup dense flat icon="close")
          q-tooltip Close

      div
        q-input(standout="bg-teal text-white" label="Название фонда" v-model="name")
        //- q-input(standout="bg-teal text-white" label="Заметка для фонда (не обязательно)" v-model="description")
        q-input(standout="bg-teal text-white" label="Процент фонда" v-model="percent" type="number" min=0 step=1)
      q-btn(flat @click="localShowAdd = false") отменить
      q-btn(color="primary" @click="addFund") добавить
</template>
