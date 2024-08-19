<template lang="pug">
div(v-if="installStore")
  div(v-for="(member,index) in installStore.soviet" v-bind:key="member.id")
    q-card(style="margin-bottom: 50px;")

      q-badge(v-if="member.role=='chairman'" style="position: absolute; top: -15px;" label="Председатель совета" color="black")
      q-badge(v-if="member.role=='member'" style="position: absolute; top: -15px;" label="Член совета" color="black")

      q-btn(style="position: absolute; top: -20px; right: 0px;" flat v-if="member.role != 'chairman'" @click="del(member.id)" icon="close" dense size="sm" round)
      p {{ installStore.soviet[index] }}
      IndividualDataForm(v-model:userData="installStore.soviet[index]")
        template(#top)
          q-input(filled v-model="installStore.soviet[index].individual_data.email" label="Электронная почта")

  div.flex.justify-around
    q-btn(@click="add" color="primary" icon="add") добавить члена
    q-btn(@click="next" color="primary" icon="done") завершить

</template>
<script lang="ts" setup>

import { useInstallCooperativeStore } from 'src/entities/Installer/model';
const installStore = useInstallCooperativeStore()
import { IndividualDataForm } from 'src/shared/ui/UserDataForm/IndividualDataForm';
import type { IIndividualData } from 'src/shared/lib/types/user/IUserData';
import { FailAlert, SuccessAlert } from 'src/shared/api';
import { useDesktopStore } from 'src/entities/Desktop/model';
import { useInstallCooperative } from '../../model';

installStore.is_finish = false

const add = () => {
  let role = 'chairman'
  if (installStore.soviet.length > 0)
    role = 'member'

  installStore.soviet.push({id: Date.now(), role, type: 'individual', individual_data: {} as IIndividualData})
}

const del = (id: number) => {
  installStore.soviet = installStore.soviet.filter(el => el.id !==  id)
}

const next = async () => {

  const forInstall = installStore.soviet.map(el => ({role: el.role as 'chairman' | 'member', individual_data: el.individual_data}))
  try {
    const {install} = useInstallCooperative()

    await install(forInstall)
    useDesktopStore().healthCheck()
    installStore.is_finish = true
    SuccessAlert('Установка произведена успешно')
  } catch(e: any){
    FailAlert(e.message)
  }

}

if (installStore.soviet.length == 0)
  add()

</script>
