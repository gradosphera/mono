<template lang="pug">
div(v-if="store")
  q-step(
    :name="store.steps.SelectBranch"
    title="Выберите кооперативный участок"
    :done="store.isStepDone('SelectBranch')"
  )
    BranchSelector(
      v-model:selectedBranch="store.state.selectedBranch"
      :branches="branches"
    )
    div.q-mt-lg
      q-btn.col-md-6.col-xs-12(flat, @click='store.prev()')
        i.fa.fa-arrow-left
        span.q-ml-md назад

      q-btn.q-mt-lg.q-mb-lg(color='primary', label='Продолжить', :disabled='!store.state.selectedBranch' @click='store.next()')

</template>

<script lang="ts" setup>
import { useBranchStore } from 'src/entities/Branch/model'
import { useRegistratorStore } from 'src/entities/Registrator'
import { FailAlert } from 'src/shared/api';
import { useSystemStore } from 'src/entities/System/model';
const { info } = useSystemStore()

import { computed, watch, ref } from 'vue'
import { BranchSelector } from 'src/shared/ui/BranchSelector';

const store = useRegistratorStore()
const branchStore = useBranchStore()
const isLoading = ref(false)

const load = async () => {
  if (!store.isStep('SelectBranch') || isLoading.value) return;

  try {
    isLoading.value = true
    await branchStore.loadPublicBranches({ coopname: info.coopname })
  } catch(e: any) {
    FailAlert(e)
  } finally {
    isLoading.value = false
  }
}

// Используем только watch с immediate: true вместо onMounted + watch
watch(() => store.state.step, async () => {
  load()
}, { immediate: true })

// Массив используется без изменений
const branches = computed(() => branchStore.publicBranches)

</script>
