<script setup lang="ts">
import { FailAlert, SuccessAlert } from 'src/shared/api'
import { api } from '../../api'
import type { ICreateOffer, IFormData } from 'src/features/Request/CreateParentOffer/model'
import { computed, ref } from 'vue'
import { Form } from 'src/shared/ui/Form'
import { useCooperativeStore } from 'src/entities/Cooperative'
import { ImageUploaderWithPreview } from '../ImageUploaderWithPreview'

const props = defineProps({
  username: {
    type: String,
    required: true,
  },
  coopname: {
    type: String,
    required: true,
  },
})

const cooperativeStore = useCooperativeStore()
cooperativeStore.loadPrograms({ coopname: props.coopname })
const programs = computed(() => cooperativeStore.programs)

const isSubmitting = ref(false)

const updateImages = (previewImage: string, images: string[]) => {
  formData.value.preview = previewImage
  formData.value.images = images
}

const formData = ref<IFormData>({
  title: '',
  description: '',
  units: 1,
  unit_cost_number: 0,
  product_lifecycle_days: 3,
  program_id: 0,
  preview: '',
  images: [],
})

const handlerSubmit = async () => {
  try {
    const unit_cost = formData.value.unit_cost_number || 0
    const offerData = ref<ICreateOffer>({
      username: props.username,
      coopname: props.coopname,
      program_id: formData.value.program_id,
      units: formData.value.units,
      unit_cost: parseFloat(unit_cost.toString()).toFixed(4) + ' ' + process.env.CURRENCY,
      product_lifecycle_secs: 86400 * formData.value.product_lifecycle_days,
      data: {
        title: formData.value.title,
        description: formData.value.description,
        preview: formData.value.preview,
        images: formData.value.images,
      },
    })
    console.log(offerData)
    await api.createParentOffer(offerData.value)
    SuccessAlert('Объявление успешно создано')
  } catch (e: any) {
    console.log(e)
    FailAlert(e.message)
  }
}
</script>
<template lang="pug">
q-card(bordered flat)
  Form(:handler-submit="handlerSubmit" :is-submitting="isSubmitting" :show-cancel="false" :button-cancel-txt="'Отменить'" :button-submit-txt="'Создать объявление'").q-mt-lg
    q-input(v-model="formData.title" square standout="bg-teal text-white" label="Заголовок").q-ma-md
    q-input(v-model="formData.description" square standout="bg-teal text-white" label="Описание" type="textarea").q-ma-md
    q-input(v-model="formData.units" square standout="bg-teal text-white" label="Количество единиц" type="number").q-ma-md
    q-input(v-model="formData.unit_cost_number" square standout="bg-teal text-white" type="number" controls-position="right" :precision="4" :step="1.0000" :min="0" label="Введите сумму:").q-ma-md
    q-input(v-model="formData.product_lifecycle_days" square standout="bg-teal text-white" label="Гарантийный срок в днях" ).q-pa-md
    q-select(v-model="formData.program_id" square standout="bg-teal text-white" :options="programs" map-options emit-value option-label="title" option-value="id" label="Целевая программа").q-ma-md
    ImageUploaderWithPreview(@update-images="updateImages").q-pt-sm.q-pb-lg
</template>
