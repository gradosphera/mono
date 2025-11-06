<template lang="pug">
div(v-if="installStore")
  div(v-for="(member,index) in installStore.soviet" v-bind:key="member.id")
    q-card(style="position: relative; padding-top: 6px;" flat)

      q-badge(v-if="member.role=='chairman'" :label="`${index+1}. Председатель совета`" style="position: absolute; top: 0; left: 0; z-index: 1; height: 32px; display: flex; align-items: center;").q-pa-sm.full-width
      q-badge(v-if="member.role=='member'" :label="`${index+1}. Член совета`" style="position: absolute; top: 0; left: 0; z-index: 1; height: 32px; display: flex; align-items: center;").q-pa-sm.full-width

        q-btn(style="top: -2px; right: -5px;"  @click="del(member.id)" color="grey" icon="close" dense size="xs" round)

      IndividualDataForm(v-model:userData="installStore.soviet[index]").q-mt-lg
        template(#top)
          q-input(
            autofocus
            standout="bg-teal text-white"
            v-model="installStore.soviet[index].individual_data.email"
            label="Электронная почта"
            type="email"
            :rules="[val => notEmpty(val), val => validEmail(val)]"
          )

  div.flex.justify-between
    q-btn(@click="back" color="grey" icon="arrow_back" label="Назад")
    div.flex.q-gutter-sm
      q-btn(@click="add" color="primary" icon="add" label="Добавить члена совета")
      q-btn(@click="next" color="primary" icon="arrow_forward" label="Далее" :loading="loading")


</template>
<script lang="ts" setup>

import { useInstallCooperativeStore } from 'src/entities/Installer/model';
const installStore = useInstallCooperativeStore()
import { IndividualDataForm } from 'src/shared/ui/UserDataForm/IndividualDataForm';
import type { IIndividualData } from 'src/shared/lib/types/user/IUserData';
import { FailAlert } from 'src/shared/api';
import { ref } from 'vue';
import { validEmail } from 'src/shared/lib/utils/validEmailRule';
import { notEmpty } from 'src/shared/lib/utils';

installStore.is_finish = false

const add = () => {
  let role: 'chairman' | 'member' = 'chairman'

  if (installStore.soviet.length > 0)
    role = 'member'

  installStore.soviet.push({id: Date.now(), type: 'individual', role, individual_data: {} as IIndividualData})
}

const del = (id: number) => {
  installStore.soviet = installStore.soviet.filter(el => el.id !==  id)
}
const loading = ref(false)

const back = () => {
  installStore.current_step = 'init'
}

const next = async () => {
  try {
    if (installStore.soviet.length === 0) {
      FailAlert('Необходимо добавить хотя бы одного члена совета')
      return
    }

    loading.value = true
    installStore.current_step = 'vars'
    loading.value = false
  } catch(e: any){
    FailAlert(e)
    loading.value = false
  }

}

if (installStore.soviet.length == 0)
  add()

</script>
