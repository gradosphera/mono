<template lang="pug">

div(v-if="coop" flat)
  div.row
    div.col-md-4.q-pa-md
      q-input(v-model="coop.username" flat readonly label="Имя аккаунта")

      // q-input(flat readonly label="Верификация" )
      //   span(v-for="verification of coop.verifications") {{verification.verificator}}
      //     q-badge {{verification.is_verified}}

      // q-input(flat readonly label="Хранилища данных" )
      //   q-btn(v-for="storage of coop.storages" flat) {{storage.storage_username}}
      q-input(v-model="coop.initial" flat readonly label="Вступительный взнос")
      q-input(v-model="coop.minimum" flat readonly label="Минимальный паевый взнос")
      q-input(v-model="coop.coop_type" flat readonly label="Тип кооператива")

    div.col-md-8.q-pa-md
      q-input(v-model="coop.announce" flat label="Краткое описание").q-mb-lg
      // q-input(flat label="Подробное описание" v-model="coop.description" type="textarea")

      span(style="color: '#666666'; font-size: 12px;").text-grey Подробное описание
      //- TiptapEditor(v-if="description" :v-model="description" @update:model-value="updateDescription")

    q-btn(color="green" @click="save") сохранить

</template>

<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useCooperativeStore } from 'src/entities/Cooperative';
import { COOPNAME } from 'src/shared/config';

const cooperativeStore = useCooperativeStore()
const description = ref<string | undefined>('')

onMounted(async () => {
  await cooperativeStore.loadPublicCooperativeData(COOPNAME)
  description.value = coop.value?.description
})

let coop = computed(() => cooperativeStore.publicCooperativeData)

const save = () => {
  console.log('on save')
}
</script>
