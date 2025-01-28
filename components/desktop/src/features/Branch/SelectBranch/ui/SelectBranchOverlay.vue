<template lang="pug">
div
  q-dialog(v-model="isVisible" persistent :maximized="true" )
    ModalBase(:title="title" :show_close="false")
      div.row.justify-center
        div(style="padding-bottom: 100px;").col-md-8.col-col-xs-12

          div(v-if="step == 1")
            p.q-mt-lg Кооператив перешёл на двухэтапную систему управления на основании общего собрания уполномоченных председателей кооперативных участков. На первом этапе пайщики принимают участие в голосовии при выбранном кооперативном участке, а на втором - уполномоченный ими председатель голосует на общем собрании уполномоченных. В связи с этим, выберите кооперативный участок, который наиболее удобен по местоположению:
            Form(:handler-submit="next" :is-submitting="isSubmitting" :showSubmit="!isLoading" :showCancel="false" :button-submit-txt="'Продолжить'" @cancel="clear").q-pa-md
              BranchSelector(
                v-model:selectedBranch="selectedBranch"
                :branches="branches"
              ).q-mb-md

          div(v-if="step == 2")
            Loader(v-if="isLoading" :text='`Формируем документ...`')

            div(v-else)
              DocumentHtmlReader(:html="document.html")
              q-btn(@click="back" flat size="sm") назад
              q-btn(@click="sign" color="primary" size="sm") подписать

  </template>

<script lang="ts" setup>
  import { ModalBase } from 'src/shared/ui/ModalBase';
  import { Form } from 'src/shared/ui/Form';
  import { failAlert, SuccessAlert } from 'src/shared/api';
  import { Loader } from 'src/shared/ui/Loader';
  import { useSelectBranch } from '../model';
  import { DocumentHtmlReader } from 'src/shared/ui/DocumentHtmlReader';
  import { computed, ref } from 'vue';
  import { DigitalDocument } from 'src/shared/lib/document';
  import { useSystemStore } from 'src/entities/System/model';
  import { useSessionStore } from 'src/entities/Session';
  import { Cooperative } from 'cooptypes'
  import { useBranchStore } from 'src/entities/Branch/model';
  import { BranchSelector } from 'src/shared/ui/BranchSelector';
  const {isVisible} = useSelectBranch()

  const title = ref('Выберите кооперативный участок');
  const step = ref(1)
  const digitalDocument = new DigitalDocument()

  const document = ref()
  const isSubmitting = ref(false)
  const isLoading = ref(false)
  const system = useSystemStore()
  const session = useSessionStore()
  const branchStore = useBranchStore()
  const selectedBranch = ref('')

  // Массив используется без изменений
  const branches = computed(() => branchStore.publicBranches)

  const next = async() => {
    generate()
    step.value++
  }

  const back = () => step.value--

  branchStore.loadPublicBranches({ coopname: system.info.coopname })

  const generate = async () => {
    isLoading.value = true
    document.value = await digitalDocument.generate<Cooperative.Registry.SelectBranchStatement.Action>({
      registry_id: Cooperative.Registry.SelectBranchStatement.registry_id,
      coopname: system.info.coopname,
      username: session.username,
      braname: selectedBranch.value
    })

    isLoading.value = false
  }

  const sign = async () => {

    try {
      isSubmitting.value = true
      isSubmitting.value = false

      const document = await digitalDocument.sign()
      const {selectBranch} = useSelectBranch()

      await selectBranch({
        braname: selectedBranch.value,
        coopname: system.info.coopname,
        document,
        username: session.username,
      })
      isVisible.value = false
      SuccessAlert('Кооперативный участок выбран')
    } catch(e: any){
      isSubmitting.value = false
      console.error(e)
      failAlert(e)
    }

  }

  const clear = () => {
    console.log('clear')
  }

  </script>
