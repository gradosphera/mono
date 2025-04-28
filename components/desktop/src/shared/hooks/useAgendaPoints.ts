import type { Mutations } from '@coopenomics/sdk'

export type AgendaPoint = Mutations.Meet.CreateAnnualGeneralMeet.IInput['data']['agenda'][number]

export function useAgendaPoints(points: AgendaPoint[]) {
  const addAgendaPoint = () => {
    points.push({
      title: '',
      context: '',
      decision: ''
    })
  }

  const removeAgendaPoint = (index: number) => {
    if (points.length > 1) {
      points.splice(index, 1)
    }
  }

  return {
    addAgendaPoint,
    removeAgendaPoint
  }
}
