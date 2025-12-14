import type { Ref } from 'vue'
import type { Mutations } from '@coopenomics/sdk'

export type AgendaPoint = Mutations.Meet.CreateAnnualGeneralMeet.IInput['data']['agenda'][number]

export function useAgendaPoints(points: Ref<AgendaPoint[]>) {
  const addAgendaPoint = () => {
    points.value.push({
      title: '',
      context: '',
      decision: ''
    } as AgendaPoint)
  }

  const removeAgendaPoint = (index: number) => {
    if (points.value.length > 1) {
      points.value.splice(index, 1)
    }
  }

  return {
    addAgendaPoint,
    removeAgendaPoint
  }
}
