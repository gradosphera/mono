<template lang="pug">
div
  q-card(flat bordered).q-pa-md.q-mb-lg
    div(v-if="!installStore.is_finish")
      p.text-h6.full-width.text-center Установка

      //- Индикатор шагов
      q-stepper.q-mb-md(v-model="installStore.current_step" flat horizontal dense)
        q-step(name="key" title="Ключ доступа" icon="key" :done="installStore.current_step !== 'key'")
        q-step(name="soviet" title="Члены совета" icon="people" :done="installStore.current_step === 'vars'")
        q-step(name="vars" title="Переменные" icon="settings")

      div.q-mt-md
        div(v-if="installStore.current_step === 'key'")
          span Для начала установки введите ключ аккаунта Кооператива, который был выдан Вам при регистрации:
          RequestKeyForm.q-mt-md
        div(v-else-if="installStore.current_step === 'soviet'")
          span Добавьте персональные данные председателя и членов совета:
          SetSovietForm.q-mt-md
        div(v-else-if="installStore.current_step === 'vars'")
          span Установите переменные кооператива для корректной работы системы:
          SetVariablesForm.q-mt-md
    div(v-else)
      p.text-h6.full-width.text-center Установка завершена
      p Всем членам совета отправлены приглашения на электронные почты со ссылками для генерации цифровых подписей. Перейдите по своей ссылке из письма, получите ключ председателя, и используйте его для входа в свою систему. Эту страницу можно закрыть.
      //- p.text-grey Ключ установки, который ранее вводился здесь, теперь используется только для входа в кабинет оператора, пайщиком которого вы стали при подключении к системе. В вашей же системе у вас новый ключ, который вы выпускаете себе сами.

</template>
<script setup lang="ts">
import { useInstallCooperativeStore } from 'src/entities/Installer/model';
import { RequestKeyForm, SetSovietForm, SetVariablesForm } from 'src/features/Installer';

const installStore = useInstallCooperativeStore()
</script>
