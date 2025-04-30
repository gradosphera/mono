<script lang="ts" setup>
import { ref, computed } from 'vue'
import { ImagesPreview } from '../ImagesPreview'
import { env } from 'src/shared/config'

const emit = defineEmits(['updateImages'])

const selectedImage = ref('')

const images = ref<string[]>([])

const select = (key: string) => {
  selectedImage.value = key
  emit('updateImages', selectedImage.value, images.value)
}

const remove = (slide: number) => {
  uploaderRef.value.reset()
  const temp_images = images.value
  images.value = []
  images.value = temp_images.filter((el, key) => key !== slide)
  selectedImage.value = images.value[0] || ''
  emit('updateImages', selectedImage.value, images.value)
}

const uploaded = (info: any) => {
  if (info.files[0].xhr.status == 200) {
    let res = JSON.parse(info.files[0].xhr.response)
    let name = res.name
    images.value.push(name)
    selectedImage.value = res.name
    emit('updateImages', selectedImage.value, images.value)
  }
}

const uploaderRef = ref()

const triggerUploader = () => {
  uploaderRef.value.pickFiles()
}

const upload_url = computed(() => env.UPLOAD_URL)
</script>

<template lang="pug">
div
  q-btn(icon="add" class="q-ml-md" @click="triggerUploader") Загрузить изображения
  q-uploader(v-show="false" ref="uploaderRef" color="grey" flat no-thumbnails multiple square auto-upload :url="upload_url" :max-file-size="104857600" @uploaded="uploaded").full-width
  ImagesPreview(v-if="images.length > 0" :images="images" :show-remove="true" @select-image="select" @remove-image="remove").q-ma-md
</template>
