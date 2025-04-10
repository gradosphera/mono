import type { App } from 'vue'
import type { Router } from 'vue-router'

export async function useInitExtensionsProcess(app: App, router: Router) {
  const modules = import.meta.glob('../../../extensions/**/install.{ts,js}')

  for (const path in modules) {
    const mod = await modules[path]()
    if (mod?.default) {
      await mod.default({ app, router })
    }
  }
}
