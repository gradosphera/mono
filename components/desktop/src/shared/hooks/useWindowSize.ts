import { computed } from 'vue'
import { useWindowSize as vueWindowSize } from 'vue-window-size'

export const useWindowSize = () => {
  const { width } = vueWindowSize()

  const isMobile = computed(() => width.value < 768)

  return {
    width,
    isMobile
  }
}
