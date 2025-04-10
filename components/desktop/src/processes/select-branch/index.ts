import { computed, ref } from 'vue'
import { useSelectBranch } from 'src/features/Branch/SelectBranch'
import { useSystemStore } from 'src/entities/System/model'
import { useSessionStore } from 'src/entities/Session'
import { useBranchStore } from 'src/entities/Branch/model'
import { DigitalDocument } from 'src/shared/lib/document'
import { SuccessAlert, FailAlert } from 'src/shared/api'
import { Cooperative } from 'cooptypes'

export function useSelectBranchProcess() {
  const title = ref('Выберите кооперативный участок')
  const step = ref(1)
  const isSubmitting = ref(false)
  const isLoading = ref(false)
  const selectedBranch = ref('')
  const document = ref()

  const digitalDocument = new DigitalDocument()

  const system = useSystemStore()
  const session = useSessionStore()
  const branchStore = useBranchStore()
  const { selectBranch } = useSelectBranch()

  const branches = computed(() => branchStore.publicBranches)

  if (session.isAuth) {
    branchStore.loadPublicBranches({ coopname: system.info.coopname })
  }

  const next = async () => {
    isLoading.value = true
    document.value = await digitalDocument.generate<Cooperative.Registry.SelectBranchStatement.Action>({
      registry_id: Cooperative.Registry.SelectBranchStatement.registry_id,
      coopname: system.info.coopname,
      username: session.username,
      braname: selectedBranch.value,
    })
    isLoading.value = false
    step.value++
  }

  const back = () => {
    step.value--
  }

  const sign = async () => {
    try {
      isSubmitting.value = true
      const doc = await digitalDocument.sign()

      await selectBranch({
        braname: selectedBranch.value,
        coopname: system.info.coopname,
        document: doc,
        username: session.username,
      })

      useSelectBranch().isVisible.value = false
      SuccessAlert('Кооперативный участок выбран')
    } catch (e: any) {
      FailAlert(e)
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    title,
    step,
    selectedBranch,
    branches,
    document,
    isSubmitting,
    isLoading,
    next,
    back,
    sign,
  }
}
