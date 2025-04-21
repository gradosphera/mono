import type { ICreateMeetInput } from 'src/features/Meet'

export type AgendaPoint = ICreateMeetInput['agenda'][number]

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
