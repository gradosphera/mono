<template lang="pug">
div
  q-btn(outline @click="showAdd = true") добавить пайщика

  q-dialog(v-model="showAdd" persistent :maximized="true" )
    q-card
      div()
        q-bar.bg-primary.text-white
          span Добавить пайщика
          q-space
          q-btn(v-close-popup dense flat icon="close")
            q-tooltip Закрыть


        div.q-pa-sm.row.justify-center
          div.q-pa-md
            span Внимание! Вы собираетесь добавить действующего пайщика в реестр цифрового кооператива. Пайщик получит приглашение на электронную почту и сможет сразу использовать систему без заполнения заявления на вступление и оплаты вступительного взноса, т.к. он сделал это ранее вне цифровой системы.
            q-stepper(v-model='step', vertical, animated, flat, done-color='primary')
              SetUserDataForm
              //- q-input(v-model="newPersona.username" label="Имя аккаунта")
              //- q-input(v-model="newPersona.position_title" label="Должность")
            div.q-mt-lg
              q-btn(flat @click="showAdd = false") Назад
              q-btn(color="primary" @click="addUser") Добавить



</template>
<script setup lang="ts">
import { ref } from 'vue';
import { SetUserDataForm } from '../SetUserDataForm';

const showAdd = ref(false)
const step = ref(1)

const addUser = () => {
  console.log('on add')
}

</script>
