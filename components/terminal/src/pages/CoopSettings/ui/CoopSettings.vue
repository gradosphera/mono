<template lang="pug">
div
  q-tabs( v-model="tab" dense switch-indicator inline-label outside-arrows mobile-arrows align="justify" active-bg-color="teal" active-color="white" indicator-color="secondary" style="border-bottom: 1px solid teal;")
    q-tab(name="Реквизиты" label="Реквизиты")

    q-tab(name="Совет" label="Совет")

    //- q-tab(name="Участки" label="Участки")

    //- q-tab(name="Администраторы" label="Администраторы")

    //- q-tab(name="Фонды" label="Фонды")

    //- q-tab(name="Контакты" label="Контакты")


  //- p info {{ info }}

  q-tab-panels(
    v-model="tab"
    animated
    transition-prev="fade"
    transition-next="fade"
  )

    q-tab-panel(name="Реквизиты")
      CooperativeDetails

    q-tab-panel(name="Совет")
      CooperativeMembers


    //- q-tab-panel(name="Участки")
    //-   p Действующие участки
    //-   p Входящие заявления на создание участка
    //-   p Связь с участками

    //- q-tab-panel(name="Администраторы")
    //-   //- staff

    //- q-tab-panel(name="Повестка")
    //-   //- decisions

    //- q-tab-panel(name="Пайщики")
    //-   //- participants

    //- q-tab-panel(name="Документы")
    //-   //- documents(:receiver="coopname")

    //- q-tab-panel(name="Программы")
    //-   div.text-h6 Программы
    //-     p Lorem ipsum dolor sit amet consectetur adipisicing elit.

    //- q-tab-panel(name="Фонды")
    //-   div.text-h6 Фонды
    //-     p Lorem ipsum dolor sit amet consectetur adipisicing elit.


  </template>

<script setup lang="ts">//
import { computed, ref } from 'vue'
import { CooperativeDetails } from 'src/widgets/Cooperative/Details';
import { CooperativeMembers } from 'src/widgets/Cooperative/Members';
// import { COOPNAME } from 'src/shared/config'
import { useCooperativeStore } from 'src/entities/Cooperative';
// const coopname = computed(() => COOPNAME)
const tab = ref('Реквизиты')

const coop = useCooperativeStore()
coop.loadPrivateCooperativeData()

// const info = computed(() => coop.privateCooperativeData)

</script>
<style>
.q-tab-panel {
  padding: 0px !important;
}
</style>
