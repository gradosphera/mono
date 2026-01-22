import { useSessionStore } from 'src/entities/Session'
import type { IDocumentPreset } from './types'
import { useSystemStore } from 'src/entities/System/model'

export const useBlagorostPresets = (): IDocumentPreset[] => {
  const systemStore = useSystemStore()
  const sessionStore = useSessionStore()

  return [
    {
      id: 'blagorost_program',
      registry_id: 998,
      title: 'Положение о ЦПП «БЛАГОРОСТ»',
      description: 'Утверждение Положения о целевой потребительской программе «БЛАГОРОСТ»',
      question: 'О утверждении Положения о целевой потребительской программе «БЛАГОРОСТ»',
      decisionPrefix: 'Утвердить Положение о целевой потребительской программе «БЛАГОРОСТ»:',
      getData: () => ({
        coopname: systemStore.info?.coopname || '',
        username: sessionStore.username,
        registry_id: 998,
      }),
    },
    {
      id: 'blagorost_offer',
      registry_id: 999,
      title: 'Пользовательское соглашение (оферта) по ЦПП «БЛАГОРОСТ»',
      description: 'Утверждение пользовательского соглашения (оферты) по присоединению к ЦПП «БЛАГОРОСТ»',
      question: 'О утверждении пользовательского соглашения (оферты) по присоединению к ЦПП «БЛАГОРОСТ»',
      decisionPrefix: 'Утвердить пользовательское соглашение (оферту) по присоединению к ЦПП «БЛАГОРОСТ»:',
      getData: () => ({
        coopname: systemStore.info?.coopname || '',
        username: sessionStore.username,
        registry_id: 999,
      }),
    },
  ]
}
