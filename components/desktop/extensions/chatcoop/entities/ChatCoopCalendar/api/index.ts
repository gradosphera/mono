import { client } from 'src/shared/api/client'
import { Mutations, Queries, Zeus } from '@coopenomics/sdk'
import type { IChatCoopCalendarEvent, IChatCoopCalendarRoomOption } from '../model/types'

type CreateCalendarEventData = Zeus.ModelTypes['CreateChatCoopCalendarEventInput']
type UpdateCalendarEventData = Zeus.ModelTypes['UpdateChatCoopCalendarEventInput']

async function listRooms(): Promise<IChatCoopCalendarRoomOption[]> {
  const { [Queries.ChatCoop.ListCalendarRooms.name]: rows } = await client.Query(
    Queries.ChatCoop.ListCalendarRooms.query,
  )
  return rows ?? []
}

async function listEvents(): Promise<IChatCoopCalendarEvent[]> {
  const { [Queries.ChatCoop.ListCalendarEvents.name]: rows } = await client.Query(
    Queries.ChatCoop.ListCalendarEvents.query,
  )
  return rows ?? []
}

async function createEvent(data: CreateCalendarEventData): Promise<IChatCoopCalendarEvent> {
  const { [Mutations.ChatCoop.CreateCalendarEvent.name]: row } = await client.Mutation(
    Mutations.ChatCoop.CreateCalendarEvent.mutation,
    { variables: { data } },
  )
  return row
}

async function updateEvent(data: UpdateCalendarEventData): Promise<IChatCoopCalendarEvent> {
  const { [Mutations.ChatCoop.UpdateCalendarEvent.name]: row } = await client.Mutation(
    Mutations.ChatCoop.UpdateCalendarEvent.mutation,
    { variables: { data } },
  )
  return row
}

async function deleteEvent(id: string): Promise<boolean> {
  const { [Mutations.ChatCoop.DeleteCalendarEvent.name]: ok } = await client.Mutation(
    Mutations.ChatCoop.DeleteCalendarEvent.mutation,
    { variables: { id } },
  )
  return ok
}

async function createIcsSubscription(): Promise<string> {
  const { [Mutations.ChatCoop.CreateCalendarIcsSubscription.name]: row } = await client.Mutation(
    Mutations.ChatCoop.CreateCalendarIcsSubscription.mutation,
    { variables: {} },
  )
  return row.icsUrl
}

export const api = {
  listRooms,
  listEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  createIcsSubscription,
}
