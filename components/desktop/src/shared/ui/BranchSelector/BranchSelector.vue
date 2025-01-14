<template lang="pug">
div
  q-select(
    label="Кооперативный участок"
    v-model="selectedBranch"
    :options="branches"
    option-value="braname"
    option-label="full_name"
    emit-value
    standout="bg-teal text-white"
    map-options
    @update:model-value="$emit('update:selectedBranch', $event)"
  )
    template(v-slot:option="scope")
      q-item(v-bind="scope.itemProps")
        q-item-section
          q-item-label(style="font-weight: bold;") {{ scope.opt.full_name }}
          q-item-label(caption) {{ scope.opt.full_address }}

    template(v-slot:selected-item="scope")
      q-avatar(text-color="black" icon="home" size="md")
      q-item-section.q-mt-sm
        q-item-label(style="font-weight: bold;") {{ scope.opt.full_name }}
        q-item-label() {{ scope.opt.full_address }}
  </template>

  <script lang="ts" setup>
  import { type IPublicBranch } from 'src/entities/Branch/model';
  import { ref, defineProps, watch } from 'vue'

  const props = defineProps({
    branches: {
      type: Object as () => IPublicBranch[],
      required: true,
    },
    modelValue: {
      type: String,
      required: false,
    },
  })

  const selectedBranch = ref(props.modelValue)

  watch(() => props.modelValue, (newVal) => {
    selectedBranch.value = newVal
  })
  </script>
