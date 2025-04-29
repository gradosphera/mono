<template lang="pug">
  div
    q-step(
      :name="store.steps.SignStatement"
      title="Подпишите заявление на вступление"
      :done="store.isStepDone('SignStatement')"
    )
      div(v-if="onSign")
        Loader(:text="loadingText")

      div(v-else)
        // Контейнер, внутри которого класс Canvas создаёт <canvas>
        .bg-grey-2(
          v-if="!onSign"
          ref="around"
          style="border: 0.1px solid grey; min-height: 300px;"
        )
        p.text-center.full-width Оставьте собственноручную подпись в рамке
        .q-mt-lg.q-mb-lg
          q-btn.col-md-4.col-xs-12(flat @click="store.prev()")
            i.fa.fa-arrow-left
            span.q-ml-md назад
          q-btn.col-md-4.col-xs-12(flat @click="clearCanvas")
            span.q-ml-md очистить
          q-btn.col-md-4.col-xs-12(color="primary" label="Продолжить" @click="setSignature")
  </template>

  <script lang="ts" setup>
  import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
  import { Notify } from 'quasar'
  import { FailAlert } from 'src/shared/api'
  import { Loader } from 'src/shared/ui/Loader'
  import { useRegistratorStore } from 'src/entities/Registrator'
  import { useCreateUser } from 'src/features/User/CreateUser'

  // Импортируем класс
  import { Classes } from '@coopenomics/sdk'
import { client } from 'src/shared/api/client'

  const store = useRegistratorStore()
  const createUser = useCreateUser()

  const around = ref<HTMLElement | null>(null)
  const onSign = ref(false)
  const loadingText = ref('')

  // Экземпляр Canvas
  let canvasClass: Classes.Canvas | null = null

  /**
   * Инициализация Canvas с задержкой
   */
  const initCanvas = () => {

    // Ждём 200ms, чтобы Quasar завершил рендеринг
    setTimeout(() => {
      if (around.value)
        canvasClass = new Classes.Canvas(around.value, {
          lineWidth: 5,
          strokeStyle: '#000',
        })
    }, 200)
  }

  /**
   * Следим за текущим шагом
   */
  watch(
    () => store.state.step,
    (newStep) => {
      if (newStep === store.steps.SignStatement) {
        nextTick(() => initCanvas())
      }
    }
  )

  /**
   * Если при загрузке уже SignStatement — инициализируем
   */
  onMounted(() => {
    if (store.state.step === store.steps.SignStatement) {
      nextTick(() => initCanvas())
    }
  })

  /**
   * При размонтировании снимаем слушатели
   */
  onBeforeUnmount(() => {
    canvasClass?.destroy()
  })

  /**
   * Очистка холста
   */
  const clearCanvas = () => {
    canvasClass?.clearCanvas()
  }

  /**
   * Получение подписи + проверка пустоты
   */
  const setSignature = async () => {
    if (!canvasClass) {
      Notify.create({
        message: 'Пожалуйста, оставьте собственноручную подпись в окне',
        color: 'negative',
      })
      return
    }

    const sign = canvasClass.getSignature()
    // Проверим, есть ли хоть один ненулевой пиксель
    const ctx = canvasClass.ctx
    const { width, height } = canvasClass.canvas
    const data = ctx.getImageData(0, 0, width, height).data
    const isEmpty = !data.some((channel) => channel !== 0)

    if (!sign || isEmpty) {
      FailAlert('Пожалуйста, оставьте собственноручную подпись в окне')
      return
    }

    try {
      onSign.value = true
      store.state.signature = sign

      // устанавливаем ключ для подписи документов
      client.Document.setWif(store.state.account.private_key)

      loadingText.value = 'Подписываем положение о ЦПП "Цифровой Кошелёк"'
      await createUser.signWalletAgreement()

      loadingText.value = 'Подписываем соглашение о политике конфиденциальности'
      await createUser.signPrivacyAgreement()

      loadingText.value = 'Подписываем соглашение о порядке и правилах использования ЭЦП'
      await createUser.signSignatureAgreement()

      loadingText.value = 'Подписываем пользовательское соглашение'
      await createUser.signUserAgreement()

      loadingText.value = 'Подписываем заявление'
      await createUser.signStatement()

      // Отправка
      await createUser.sendStatementAndAgreements()

      loadingText.value = ''
      onSign.value = false
      store.next()
    } catch (err: any) {
      onSign.value = false
      FailAlert(err)
    }
  }
  </script>
