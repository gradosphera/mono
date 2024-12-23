<template lang="pug">
div
  q-btn(size="sm" @click="showAdd = true" color="primary")
    q-icon(name="add")
    span добавить пайщика
  q-dialog(v-model="showAdd" persistent :maximized="false" )
    q-card
      div()
        q-bar.bg-gradient-dark.text-white
          span Добавить пайщика
          q-space
          q-btn(v-close-popup dense flat icon="close")
            q-tooltip Закрыть

        div.q-pa-sm.row.justify-center
          div.q-pa-md
            div.q-pb-md
              span Внимание! Вы собираетесь добавить действующего пайщика в реестр цифрового кооператива. Пайщик получит приглашение на электронную почту и сможет сразу использовать систему без заполнения заявления на вступление и оплаты вступительного взноса, т.к. он сделал это ранее вне цифровой системы.

            UserDataForm(v-model:userData="state.userData")
              template(#top)
                q-input(@change="changeEmail" v-model="state.email" standout="bg-teal text-white" label="Электронная почта" :rules='[validateEmail, validateExists]').q-mb-md

              template(#bottom="{userDataForm}")

                q-input(
                  standout="bg-teal text-white"
                  v-model="addUserState.created_at"
                  mask="datetime"
                  label="Дата и время подписания заявления"
                  placeholder="год/месяц/день часы:минуты"
                  :rules="[val => notEmpty(val)]"
                  autocomplete="off"
                  hint="когда пайщик был принят в кооператив"
                ).q-mt-md

                q-input(
                  standout="bg-teal text-white"
                  v-model="initial"
                  type="number"
                  :min="0"
                  label="Размер вступительного взноса"
                  :rules="[val => moreThenZero(val)]"
                  hint="был оплачен пайщиком при вступлении"
                  ).q-mt-md
                  template(#append)
                    span.text-overline {{ coop.governSymbol }}
                    q-btn(icon="sync" flat dense @click="refresh('initial')")

                q-input(standout="bg-teal text-white" v-model="minimum" hint="был оплачен пайщиком при вступлении" type="number" label="Размер минимального паевого взноса" :rules="[val => moreThenZero(val)]").q-mt-md
                  template(#append)
                    span.text-overline {{ coop.governSymbol }}
                    q-btn(icon="sync" flat dense @click="refresh('minimum')")

                q-card(flat).q-mt-md

                  q-item(tag="label" v-ripple)
                    q-item-section(avatar)
                      q-checkbox(v-model="addUserState.spread_initial")

                    q-item-section
                      q-item-label Начислить вступительный взнос
                      q-item-label(caption) Вступительный взнос будет зачислен на счёт кошелька кооператива и станет доступен для списания по фонду хозяйственной деятельности.


                q-card(flat).q-mt-md

                  q-item(tag="label" v-ripple)
                    q-item-section(avatar)
                      q-checkbox(v-model="spread_minimum" disable )

                    q-item-section
                      q-item-label Начислить минимальный паевый взнос
                      q-item-label(caption) Минимальный паевый взнос будет зачислен на оборотный счет кооператива и учитываться в процессе возврата при выходе пайщика из кооператива.



                div.q-mt-lg
                  q-btn(flat @click="showAdd = false") Отмена
                  q-btn(color="primary" @click="addUserNow(userDataForm)" :loading="loading") Добавить


</template>
<script setup lang="ts">
/**
 * 1. При первой загрузке показываем системные параметры взносов.
 * 2. Если параметр изменяется вручную, сохраняем его локально для организации или физлица/ип отдельно.
 * 3. Кнопка сброса возвращает системные параметры взносов.
 */
import { computed, onMounted, ref, watch } from 'vue';
import { UserDataForm } from 'src/shared/ui/UserDataForm/UserDataForm';
import { useAddUser } from '../../model';
import { useCooperativeStore } from 'src/entities/Cooperative';

import { useRegistratorStore } from 'src/entities/Registrator';
import { FailAlert, SuccessAlert } from 'src/shared/api';
import { useCreateUser } from 'src/features/User/CreateUser';
import { COOPNAME } from 'src/shared/config';
import { notEmpty } from 'src/shared/lib/utils';

const { state, addUserState, clearUserData } = useRegistratorStore()
const spread_minimum = ref(true) //TODO REPLACE IT!
const minimum = ref(0)
const initial = ref(0)

watch(initial, (newValue) => {
  if (state.userData.type === 'organization')
    addUserState.org_initial = Number(newValue)
  else addUserState.initial = Number(newValue)
})

watch(minimum, (newValue) => {
  if (state.userData.type === 'organization')
    addUserState.org_minimum = Number(newValue)
  else addUserState.minimum = Number(newValue)
})

const { addUser } = useAddUser()
const api = useCreateUser()

const coop = useCooperativeStore()

onMounted(async () => {

  await coop.loadPublicCooperativeData(COOPNAME)

  if (coop.publicCooperativeData) {

    if (addUserState.initial == 0)
      addUserState.initial = parseFloat(coop.publicCooperativeData.initial)

    if (addUserState.minimum == 0)
      addUserState.minimum = parseFloat(coop.publicCooperativeData.minimum)

    if (addUserState.org_initial == 0)
      addUserState.org_initial = parseFloat(coop.publicCooperativeData.org_initial)

    if (addUserState.org_minimum == 0)
      addUserState.org_minimum = parseFloat(coop.publicCooperativeData.org_minimum)

    updateLocalVars()
  }

})

const updateLocalVars = () => {
  if (state.userData.type === 'organization') {
    initial.value = addUserState.org_initial
    minimum.value = addUserState.org_minimum
  } else {
    initial.value = addUserState.initial
    minimum.value = addUserState.minimum
  }
}

watch(() => state.userData.type, () => {
  updateLocalVars()
})

const refresh = (what: string) => {
  if (coop.publicCooperativeData)
    if (state.userData.type === 'organization') {
      if (what === 'initial')
        addUserState.org_initial = parseFloat(coop.publicCooperativeData.org_initial)
      else
        addUserState.org_minimum = parseFloat(coop.publicCooperativeData.org_minimum)
    } else {
      if (what === 'initial')
        addUserState.initial = parseFloat(coop.publicCooperativeData.initial)
      else
        addUserState.minimum = parseFloat(coop.publicCooperativeData.minimum)
    }

  updateLocalVars()
}

const isValidEmail = computed(() => api.emailIsValid(state.email))

const isEmailExist = ref(false)

const validateEmail = () => {
  return isValidEmail.value || 'Введите корректный email'
}

const validateExists = () => {
  return !isEmailExist.value || 'Пользователь с таким email уже существует. Войдите.'
}

const changeEmail = () => {
  if (state.userData.individual_data)
    state.userData.individual_data.email = state.email
  if (state.userData.organization_data)
    state.userData.organization_data.email = state.email
  if (state.userData.entrepreneur_data)
    state.userData.entrepreneur_data.email = state.email
}

const showAdd = ref(false)
const loading = ref(false)

const addUserNow = (userDataForm: any) => {
  userDataForm.validate().then(async (success: boolean) => {
    if (success) {
      try {
        loading.value = true
        await addUser()
        SuccessAlert('Пайщик добавлен в реестр, а приглашение отправлено на его email');
        showAdd.value = false
        addUserState.created_at = ''
        clearUserData()
        loading.value = false
      } catch (e: any) {
        loading.value = false
        FailAlert(`Возникла ошибка: ${e.message}`)
      }

    } else {
      const firstInvalid = document.querySelector('.q-field--error .q-field__native');
      if (firstInvalid) {
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
  })

}

const moreThenZero = (val: number) => {
  return val > 0 || 'Взнос должен быть положительным'
}

</script>
