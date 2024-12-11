<template lang="pug">
div(v-if="store")
  q-step(
    :name="store.steps.SelectBranch"
    title="Выберите ближайший кооперативный участок"
    :done="store.isStepDone('SelectBranch')"
  )

    q-select(
      label="Кооперативный участок"
      v-model="store.state.selectedBranch"
      :options="branches"
      option-value="braname"
      option-label="full_name"
      emit-value
      standout="bg-teal text-white"
      map-options
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
    div.q-mt-lg
      q-btn.col-md-6.col-xs-12(flat, @click='store.prev()')
        i.fa.fa-arrow-left
        span.q-ml-md назад

      q-btn.q-mt-lg.q-mb-lg(color='primary', label='Продолжить', :disabled='!store.state.selectedBranch' @click='store.next()')

</template>

<script lang="ts" setup>
import { useBranchStore } from 'src/entities/Branch/model'
import { useRegistratorStore } from 'src/entities/Registrator'
import { failAlert } from 'src/shared/api';
import { COOPNAME } from 'src/shared/config'
import { computed, onMounted, watch } from 'vue'

const store = useRegistratorStore()
const branchStore = useBranchStore()

const load = async () => {
  if (store.isStep('SelectBranch'))
    try{
      await branchStore.loadPublicBranches({ coopname: COOPNAME })
    } catch(e: any){
      failAlert(e)
    }
}

onMounted(() => load())

watch(() => store.state.step, async () => {
  load()
})

// Массив используется без изменений
const branches = computed(() => branchStore.publicBranches)

</script>
