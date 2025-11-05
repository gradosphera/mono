<template lang="pug">
div.row.justify-center
  div.col-md-12.col-sm-6.col-xs-12
    div
      q-card(flat).q-pa-md.q-mb-lg
        div(v-if="!installStore.is_finish")

          //- Индикатор шагов
          q-stepper.q-mb-md(v-model="installStore.current_step" vertical flat dense)
            q-step(:name="'key'" title="Ключ доступа" icon="key" :done="isStepDone('key')")
              span Для начала установки введите ключ аккаунта Кооператива, который был выдан Вам при регистрации:
              RequestKeyForm.q-mt-md

            q-step(:name="'init'" title="Инициализация" icon="business" :done="isStepDone('init')")
              span Заполните данные организации для инициализации кооператива:
              SetInitForm.q-mt-md

            q-step(:name="'soviet'" title="Члены совета" icon="people" :done="isStepDone('soviet')")
              span Добавьте персональные данные председателя и членов совета:
              SetSovietForm.q-mt-md

            q-step(:name="'vars'" title="Переменные" icon="settings" :done="isStepDone('vars')")
              span Установите переменные кооператива для корректной работы системы:
              SetVariablesForm.q-mt-md
        div(v-else)
          p.text-h6.full-width.text-center Установка завершена
          p.q-mb-md Всем членам совета отправлены приглашения на электронные почты со ссылками для генерации цифровых подписей. Перейдите по своей ссылке из письма, получите ключ председателя, и используйте его для входа в свою систему.

          div.flex.justify-center.q-mt-lg
            q-btn(
              @click="goToSignin"
              color="primary"
              label="Войти"
              icon="login"
            )
          //- p.text-grey Ключ установки, который ранее вводился здесь, теперь используется только для входа в кабинет оператора, пайщиком которого вы стали при подключении к системе. В вашей же системе у вас новый ключ, который вы выпускаете себе сами.
</template>

<script setup lang="ts">
import { useInstallCooperativeStore } from 'src/entities/Installer/model';
import { RequestKeyForm, SetInitForm, SetSovietForm, SetVariablesForm } from 'src/features/Installer';
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useSystemStore } from 'src/entities/System/model';

const router = useRouter();
const systemStore = useSystemStore();
const installStore = useInstallCooperativeStore()

const stepOrder = ['key', 'init', 'soviet', 'vars'] as const;

const isStepDone = computed(() => (step: typeof stepOrder[number]) => {
  const currentIndex = stepOrder.indexOf(installStore.current_step);
  const stepIndex = stepOrder.indexOf(step);
  return stepIndex < currentIndex;
});

const goToSignin = () => {
  router.push({
    name: 'signin',
    params: { coopname: systemStore.info.coopname }
  });
};
</script>
