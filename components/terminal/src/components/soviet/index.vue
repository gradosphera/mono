<template lang="pug">
div
  q-tabs( v-model="tab" dense switch-indicator inline-label outside-arrows mobile-arrows align="justify" active-bg-color="teal" active-color="white" indicator-color="secondary")
    // q-tab(name="Дашборд" icon="mail" label="Дашборд")
    //- q-tab(name="Повестка" label="Повестка")

    //- q-tab(name="Пайщики" label="Пайщики")
    //- q-tab(name="Документы" label="Документы")

    q-tab(name="Администраторы" label="Администраторы")

    q-tab(name="Члены совета" label="Члены совета")
    q-tab(name="Кооператив" label="Кооператив")

    // q-tab(name="Участки" icon="people" label="Участки")

    // q-tab(name="Программы" label="Программы")
    // q-tab(name="Собрания" icon="people" label="Собрания")
    // q-tab(name="Фонды"  label="Фонды")

  q-tab-panels(
    v-model="tab"
    animated
    transition-prev="fade"
    transition-next="fade"
  )
    // q-tab-panel(name="Дашборд")
    //   p Дашборд

    q-tab-panel(name="Кооператив")
      cooperative
        // boards.col-md-12.col-xs-12.q-pa-md

    q-tab-panel(name="Члены совета")
      members

    q-tab-panel(name="Участки")
      p Действующие участки
      p Входящие заявления на создание участка
      p Связь с участками

    q-tab-panel(name="Администраторы")
      staff

    q-tab-panel(name="Повестка")
      decisions

    q-tab-panel(name="Пайщики")
      participants

    q-tab-panel(name="Документы")
      documents(:receiver="coopname")

    q-tab-panel(name="Программы")
      div.text-h6 Программы
        p Lorem ipsum dolor sit amet consectetur adipisicing elit.

    q-tab-panel(name="Собрания")
      div.text-h6 Собрания
        p Lorem ipsum dolor sit amet consectetur adipisicing elit.

    q-tab-panel(name="Фонды")
      div.text-h6 Фонды
        p Lorem ipsum dolor sit amet consectetur adipisicing elit.


</template>

<script setup lang="ts">//
import { computed, ref } from 'vue'
import cooperative from './cooperative.vue'
import members from './members.vue'
import staff from './staff.vue'
import decisions from './decisions.vue'
import participants from './participants.vue'
import documents from './documents.vue'
import { COOPNAME } from 'src/shared/config'
const coopname = computed(() => COOPNAME)
const tab = ref('Повестка')

</script>
<style>
.q-tab-panel {
  padding: 0px !important;
}
</style>
