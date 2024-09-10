<template lang='pug'>
div
  q-step(:name='5', title='Подпишите заявление на вступление', :done='step > 5')
    div(v-if='onSign')
      Loader(:text='loadingText')
    div(v-else)
      .bg-grey-2(v-if='!onSign' ref='around', style='border: 0.1px solid grey; min-height: 300px;')
        canvas(
          ref='canvas',
          @touchstart='startDrawing',
          @touchmove='draw',
          @touchend='endDrawing',
          @mousedown='startDrawing',
          @mousemove='draw',
          @mouseup='endDrawing'
        )
      p.text-center.full-width Оставьте собственноручную подпись в рамке

      .q-mt-lg.q-mb-lg
        q-btn.col-md-4.col-xs-12(flat, @click='store.step--')
          i.fa.fa-arrow-left
          span.q-ml-md назад
        q-btn.col-md-4.col-xs-12(flat, @click='clearCanvas')
          span.q-ml-md очистить

        q-btn.col-md-4.col-xs-12(color='primary', label='Продолжить', @click='setSignature')
</template>
<script lang="ts" setup>
import { ref, computed, watch, onBeforeMount, nextTick, onMounted } from 'vue'
import { useCreateUser } from 'src/features/Registrator/CreateUser'
import { Notify } from 'quasar'
import { FailAlert } from 'src/shared/api';
import { Loader } from 'src/shared/ui/Loader';

import { useRegistratorStore } from 'src/entities/Registrator'
const store = useRegistratorStore().state


const createUser = useCreateUser()

const step = computed(() => store.step)
const around = ref()
const onSign = ref(false)
const loadingText = ref('')

const canvas = ref<HTMLCanvasElement | null>(null)
const drawing = ref<boolean>(false)
let context: CanvasRenderingContext2D | null = null
let lastX = 0
let lastY = 0

const windowWidth = ref<number>()
const windowHeight = ref<number>()

const setSignature = async (): Promise<void> => {
  if (!context || !canvas.value) {
    Notify.create({
      message: 'Пожалуйста, оставьте собственноручную подпись в окне',
      color: 'negative',
    })
    return
  }


  const imgData = context.getImageData(0, 0, canvas.value.width, canvas.value.height).data
  const isEmpty = !imgData.some((channel) => channel !== 0)
  const sign = canvas.value.toDataURL('image/png')

  if (!sign || isEmpty) {
    FailAlert('Пожалуйста, оставьте собственноручную подпись в окне')
    return
  }

  try {
    onSign.value = true
    store.signature = sign

    loadingText.value = 'Подписываем соглашение о ЦПП "Цифровой Кошелёк"'

    await createUser.signWalletAgreement()

    loadingText.value = 'Подписываем заявление'

    await createUser.signStatement()

    //посылаем
    await createUser.sendStatementAndAgreements()
    loadingText.value = ''

    onSign.value = false
    store.step++
  } catch (e: any) {
    onSign.value = false
    FailAlert(e.message)
  }


}

const init = (): void => {
  prepareCanvas()
}

watch(step, (newStep) => {
  if (newStep == 5) {
    init()
  }
})

window.addEventListener('resize', () => {
  prepareCanvas()
})

onBeforeMount(() => {
  window.removeEventListener('resize', prepareCanvas)
})

onMounted(() => {
  init()
})

const prepareCanvas = (): void => {
  nextTick(() => {
    windowWidth.value = around.value?.offsetWidth || 0
    windowHeight.value = around.value?.offsetHeight || 0

    context = canvas.value?.getContext('2d') ?? null

    if (context) {
      if (canvas.value) {
        canvas.value.width = windowWidth.value || 0
        canvas.value.height = windowHeight.value || 0
      }
      context.strokeStyle = 'grey'
      context.lineWidth = 5
      context.lineJoin = 'round'
      context.lineCap = 'round'
      context.strokeStyle = '#000'
    }
  })
}

const clearCanvas = (): void => {
  context?.clearRect(0, 0, canvas.value?.width || 0, canvas.value?.height || 0)
}

const startDrawing = (e: MouseEvent | TouchEvent): void => {
  e.preventDefault()
  drawing.value = true
  const rect = canvas.value?.getBoundingClientRect()
  lastX =
    e instanceof MouseEvent
      ? e.clientX - (rect?.left || 0)
      : e.touches[0].clientX - (rect?.left || 0)
  lastY =
    e instanceof MouseEvent ? e.clientY - (rect?.top || 0) : e.touches[0].clientY - (rect?.top || 0)
}

const endDrawing = (): void => {
  drawing.value = false
}

const draw = (e: MouseEvent | TouchEvent): void => {
  e.preventDefault()
  if (!drawing.value) return
  context?.beginPath()
  context?.moveTo(lastX, lastY)
  const rect = canvas.value?.getBoundingClientRect()
  const x =
    e instanceof MouseEvent
      ? e.clientX - (rect?.left || 0)
      : e.touches[0].clientX - (rect?.left || 0)
  const y =
    e instanceof MouseEvent ? e.clientY - (rect?.top || 0) : e.touches[0].clientY - (rect?.top || 0)
  context?.lineTo(x, y)
  context?.stroke()
  lastX = x
  lastY = y
}
</script>
