<template lang="pug">
div(v-if="install")
  div(v-for="(member,index) in install.soviet" v-bind:key="member.id")
    q-card(style="margin-bottom: 50px;")

      q-badge(v-if="member.role=='chairman'" style="position: absolute; top: -15px;" label="Председатель совета" color="black")
      q-badge(v-if="member.role=='member'" style="position: absolute; top: -15px;" label="Член совета" color="black")

      q-btn(style="position: absolute; top: -20px; right: 0px;" flat v-if="member.role != 'chairman'" @click="del(member.id)" icon="close" dense size="sm" round)
      p {{ install.soviet[index] }}
      IndividualDataForm(v-model:userData="install.soviet[index]")
        template(#top)
          q-input(filled v-model="install.soviet[index].individual_data.email" label="Электронная почта")

  div.flex.justify-around
    q-btn(@click="add" color="primary" icon="add") добавить члена
    q-btn(@click="next" color="primary" icon="done") завершить

</template>
<script lang="ts" setup>

import { useInstallCooperativeStore } from 'src/entities/Installer/model';
import { computed } from 'vue';
const install = useInstallCooperativeStore()
import { IndividualDataForm } from 'src/shared/ui/UserDataForm/IndividualDataForm';
import type { IIndividualData } from 'src/shared/lib/types/user/IUserData';
import { api } from '../../api';
import { FailAlert, SuccessAlert } from 'src/shared/api';
import { useDesktopStore } from 'src/entities/Desktop/model';
import { useRouter } from 'vue-router';

install.is_finish = false

const add = () => {
  let role = 'chairman'
  if (install.soviet.length > 0)
    role = 'member'

  install.soviet.push({id: Date.now(), role, type: 'individual', individual_data: {} as IIndividualData})
}

const del = (id: number) => {
  install.soviet = install.soviet.filter(el => el.id !==  id)
}

const next = async () => {

  const forInstall = install.soviet.map(el => ({role: el.role as 'chairman' | 'member', individual_data: el.individual_data}))
  try {
    await api.install(forInstall)
    useDesktopStore().healthCheck()
    install.is_finish = true
    SuccessAlert('Установка произведена успешно')
  } catch(e){
    FailAlert(e.message)
  }

}

if (install.soviet.length == 0)
  add()

</script>
