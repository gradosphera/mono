<template lang="pug">
q-input(
  :label="label"
  :model-value="modelValue"
  :readonly="readonly"
  :standout="standout"
  :dense="dense"
  :class="inputClass"
)
  template(v-slot:append)
    q-btn(
      flat
      round
      dense
      icon="fa fa-copy"
      @click="copyToClipboard"
    )
      q-tooltip Копировать
</template>

<script lang="ts" setup>
import { copyToClipboard as copy } from 'quasar'
import { FailAlert, SuccessAlert } from 'src/shared/api'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    required: true
  },
  label: {
    type: String,
    default: ''
  },
  readonly: {
    type: Boolean,
    default: true
  },
  standout: {
    type: [Boolean, String],
    default: false
  },
  dense: {
    type: Boolean,
    default: false
  },
  inputClass: {
    type: String,
    default: ''
  }
})

const copyToClipboard = () => {
  copy(String(props.modelValue))
    .then(() => {
      SuccessAlert('Скопировано в буфер обмена')
    })
    .catch((e) => {
      console.error(e)
      FailAlert('Не удалось скопировать')
    })
}
</script>
