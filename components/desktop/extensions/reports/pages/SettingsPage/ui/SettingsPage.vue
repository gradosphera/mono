<template lang="pug">
div.page-shell
  //- Статус автосохранения (неинвазивный — справа сверху карточки)
  q-card.q-mt-md(flat)
    q-card-section.q-py-sm
      .row.items-center.no-wrap
        .col
          .text-h6 Реквизиты организации
          .text-caption.text-grey-7 Справочные данные кооператива — не редактируются
        .col-auto
          q-chip(
            v-if='saveStatus !== "idle"'
            dense
            size='sm'
            :color='saveChipColor'
            :icon='saveChipIcon'
            text-color='white'
          ) {{ saveChipLabel }}

    q-separator

    q-card-section
      .row.q-col-gutter-sm
        RequisiteField.col-md-6.col-12(
          v-for='f in orgFields'
          :key='f.key'
          :id='`field-${f.key}`'
          :label='f.label'
          :value='getValue(f.key)'
          read-only
        )

  //- Классификаторы (ручной ввод, обязательные)
  q-card.q-mt-md(flat)
    q-card-section.q-py-sm
      .text-h6 Классификаторы
      .text-caption.text-grey-7 ОКВЭД, ОКФС, ОКОПФ, ОКТМО, ОКПО — обязательны для большинства отчётов ФНС

    q-separator

    q-card-section
      .row.q-col-gutter-sm
        RequisiteField.col-md-4.col-12(
          v-for='f in classifierFields'
          :key='f.key'
          :id='`field-${f.key}`'
          :label='f.label'
          :value='manualInput[f.key]'
          :placeholder='f.placeholder'
          :mask='f.mask'
          :digits-only='f.digitsOnly'
          :digits-dots-only='f.digitsDotsOnly'
          :max-length='f.maxLength'
          :exact-lengths='f.exactLengths'
          :pattern='f.pattern'
          :pattern-message='f.patternMessage'
          required
          @update:value='v => (manualInput[f.key] = v)'
          @blur='scheduleSave'
        )

  //- СФР (ЕФС-1)
  q-card.q-mt-md(flat)
    q-card-section.q-py-sm
      .text-h6 СФР (для ЕФС-1)
      .text-caption.text-grey-7 Регистрационный номер СФР и должность председателя

    q-separator

    q-card-section
      .row.q-col-gutter-sm
        RequisiteField.col-md-6.col-12(
          id='field-sfrRegNumber'
          label='Рег. номер СФР'
          :value='manualInput.sfrRegNumber'
          placeholder='XXX-XXX-XXXXXX'
          mask='###-###-######'
          required
          @update:value='v => (manualInput.sfrRegNumber = v)'
          @blur='scheduleSave'
        )
        RequisiteField.col-md-6.col-12(
          id='field-chairmanPosition'
          label='Должность председателя'
          :value='manualInput.chairmanPosition'
          placeholder='Председатель'
          :max-length='100'
          required
          @update:value='v => (manualInput.chairmanPosition = v)'
          @blur='scheduleSave'
        )

  //- Подписант
  q-card.q-mt-md(flat)
    q-card-section.q-py-sm
      .text-h6 Подписант
      .text-caption.text-grey-7 Кто подписывает отчёты: председатель или представитель (по доверенности)

    q-separator

    q-card-section
      .row.q-col-gutter-sm
        .col-md-6.col-12
          q-select(
            v-model='signerType'
            :options='signerTypeOptions'
            label='Тип подписанта'
            dense outlined
            emit-value map-options
            @update:model-value='onSignerTypeChange'
          )
        RequisiteField.col-md-6.col-12(
          id='field-signerSnils'
          label='СНИЛС подписанта'
          :value='manualInput.signerSnils'
          placeholder='XXX-XXX-XXX XX'
          mask='###-###-### ##'
          required
          @update:value='v => (manualInput.signerSnils = v)'
          @blur='scheduleSave'
        )
        RequisiteField.col-12(
          v-if='signerType === "representative"'
          id='field-signerRepDoc'
          label='Документ представителя'
          :value='manualInput.signerRepDoc'
          placeholder='Доверенность № X от DD.MM.YYYY'
          :max-length='200'
          required
          @update:value='v => (manualInput.signerRepDoc = v)'
          @blur='scheduleSave'
        )


</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount, nextTick, computed } from 'vue'
import { useRoute } from 'vue-router'
import { FailAlert } from 'src/shared/api'
import { useReportStore } from 'src/entities/Report'
import type { IReportRequisitesView, IUpdateReportRequisitesInput } from 'src/entities/Report'
import RequisiteField from './RequisiteField.vue'

const route = useRoute()
const reportStore = useReportStore()

const loading = ref(false)
const requisites = ref<IReportRequisitesView | null>(null)

// Автосохранение: состояние статуса показывается бейджем «Сохраняется…» / «Сохранено».
// idle при старте (до любой правки), saving/saved/error — по факту.
type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'
const saveStatus = ref<SaveStatus>('idle')

const saveChipColor = computed(() => {
  if (saveStatus.value === 'saving') return 'orange'
  if (saveStatus.value === 'saved') return 'positive'
  if (saveStatus.value === 'error') return 'negative'
  return 'grey'
})
const saveChipIcon = computed(() => {
  if (saveStatus.value === 'saving') return 'fa-solid fa-rotate'
  if (saveStatus.value === 'saved') return 'fa-solid fa-check'
  if (saveStatus.value === 'error') return 'fa-solid fa-triangle-exclamation'
  return ''
})
const saveChipLabel = computed(() => {
  if (saveStatus.value === 'saving') return 'Сохраняется…'
  if (saveStatus.value === 'saved') return 'Сохранено'
  if (saveStatus.value === 'error') return 'Ошибка сохранения'
  return ''
})

type ManualKey =
  | 'okved'
  | 'okfs'
  | 'okopf'
  | 'oktmo'
  | 'okpo'
  | 'sfrRegNumber'
  | 'chairmanPosition'
  | 'signerSnils'
  | 'signerRepDoc'
  | 'phoneOverride'
  | 'addressOverride'

const manualInput = reactive<Record<ManualKey, string>>({
  okved: '',
  okfs: '',
  okopf: '',
  oktmo: '',
  okpo: '',
  sfrRegNumber: '',
  chairmanPosition: '',
  signerSnils: '',
  signerRepDoc: '',
  phoneOverride: '',
  addressOverride: '',
})

const signerType = ref<'chairman' | 'representative'>('chairman')

const orgFields: { key: keyof IReportRequisitesView; label: string }[] = [
  { key: 'inn', label: 'ИНН' },
  { key: 'kpp', label: 'КПП' },
  { key: 'ogrn', label: 'ОГРН' },
  { key: 'orgName', label: 'Наименование' },
  { key: 'address', label: 'Адрес' },
  { key: 'phone', label: 'Телефон' },
  { key: 'signerLastName', label: 'Фамилия подписанта' },
  { key: 'signerFirstName', label: 'Имя подписанта' },
  { key: 'signerMiddleName', label: 'Отчество подписанта' },
]

interface ClassifierField {
  key: ManualKey
  label: string
  placeholder?: string
  mask?: string
  digitsOnly?: boolean
  digitsDotsOnly?: boolean
  maxLength?: number
  exactLengths?: number[]
  pattern?: RegExp
  patternMessage?: string
}

// ОКВЭД разрешает дробные уровни (NN.NN.NN); фиксированной маски нет.
// ОКОПФ — ровно 5 цифр (mask ##### подставит слоты).
// ОКФС/ОКТМО/ОКПО — фиксированные варианты длины; используем digitsOnly + exactLengths.
const classifierFields: ClassifierField[] = [
  {
    key: 'okved',
    label: 'ОКВЭД',
    placeholder: '94.99',
    digitsDotsOnly: true,
    maxLength: 8,
    pattern: /^\d{2}(\.\d{1,2}){0,2}$/,
    patternMessage: 'Формат: 94.99 или 46.73.7',
  },
  {
    key: 'okfs',
    label: 'ОКФС',
    placeholder: '16',
    digitsOnly: true,
    maxLength: 3,
    pattern: /^\d{1,3}$/,
    patternMessage: '1–3 цифры',
  },
  {
    key: 'okopf',
    label: 'ОКОПФ',
    placeholder: '20200',
    mask: '#####',
    digitsOnly: true,
    maxLength: 5,
    exactLengths: [5],
  },
  {
    key: 'oktmo',
    label: 'ОКТМО',
    placeholder: '8 или 11 цифр',
    digitsOnly: true,
    maxLength: 11,
    exactLengths: [8, 11],
  },
  {
    key: 'okpo',
    label: 'ОКПО',
    placeholder: '8 или 10 цифр',
    digitsOnly: true,
    maxLength: 10,
    exactLengths: [8, 10],
  },
]

const signerTypeOptions = [
  { label: 'Председатель', value: 'chairman' },
  { label: 'Представитель', value: 'representative' },
]

function getValue(key: keyof IReportRequisitesView): string {
  const v = requisites.value?.[key] as any
  if (v && typeof v === 'object' && 'value' in v) return String(v.value ?? '')
  return ''
}

async function loadRequisites() {
  loading.value = true
  try {
    const data = await reportStore.loadRequisites()
    if (data) {
      requisites.value = data
      for (const key of Object.keys(manualInput) as ManualKey[]) {
        const v = (data as any)[key]
        if (v && typeof v === 'object' && 'value' in v && v.value) {
          manualInput[key] = String(v.value)
        }
      }
      const serverSignerType = (data as any).signerType
      if (serverSignerType === 'chairman' || serverSignerType === 'representative') {
        signerType.value = serverSignerType
      }
    }
  } catch (e: any) {
    FailAlert(e, 'Ошибка загрузки реквизитов')
  } finally {
    loading.value = false
  }
}

// Автосохранение по blur: каждый RequisiteField эмитит `blur` после потери
// фокуса, мы коалесцируем несколько подряд blur-ов коротким debounce (600ms),
// чтобы при быстром tab-переходе между полями не бить серверу 5 запросами.
// Во время ввода сохранение не запускается — иначе валидация срабатывает
// на частично набранное значение.
let saveTimer: ReturnType<typeof setTimeout> | null = null
let savedStatusTimer: ReturnType<typeof setTimeout> | null = null
const DEBOUNCE_MS = 600

function scheduleSave() {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    void persist()
  }, DEBOUNCE_MS)
}

async function persist() {
  saveStatus.value = 'saving'
  try {
    const input: Record<string, string | null> = {}
    for (const key of Object.keys(manualInput) as ManualKey[]) {
      const v = manualInput[key]
      input[key] = v && v.length > 0 ? v : null
    }
    input.signerType = signerType.value
    await reportStore.updateRequisites(input as IUpdateReportRequisitesInput)
    // Не перезагружаем всё (иначе каретка в поле улетит) — фиксируем только статус.
    saveStatus.value = 'saved'
    if (savedStatusTimer) clearTimeout(savedStatusTimer)
    savedStatusTimer = setTimeout(() => {
      if (saveStatus.value === 'saved') saveStatus.value = 'idle'
    }, 2000)
  } catch (e: any) {
    saveStatus.value = 'error'
    FailAlert(e, 'Ошибка сохранения')
  }
}

function onSignerTypeChange() {
  // q-select эмитит один раз при выборе — сохраняем сразу после debounce.
  scheduleSave()
}

onMounted(async () => {
  await loadRequisites()
  if (route.query.focus) {
    await nextTick()
    const el = document.getElementById(`field-${route.query.focus}`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
})

onBeforeUnmount(() => {
  // Если правка не успела долететь — дописываем синхронно перед уходом,
  // чтобы не потерять ввод.
  if (saveTimer) {
    clearTimeout(saveTimer)
    void persist()
  }
  if (savedStatusTimer) clearTimeout(savedStatusTimer)
})
</script>
