import type { MakeAllFieldsRequired } from '../../utils/MakeAllFieldsRequired'
import { type ModelTypes, Selector, type ValueTypes } from '../../zeus/index'

const rawChatcoopProjectCommunicationRoomSelector = {
  matrixRoomId: true,
  displayLabel: true,
}

const _validateRoom: MakeAllFieldsRequired<ValueTypes['ChatcoopProjectCommunicationRoom']> =
  rawChatcoopProjectCommunicationRoomSelector

export type ChatcoopProjectCommunicationRoomModel = ModelTypes['ChatcoopProjectCommunicationRoom']

export const chatcoopProjectCommunicationRoomSelector = Selector('ChatcoopProjectCommunicationRoom')(
  rawChatcoopProjectCommunicationRoomSelector,
)
export { rawChatcoopProjectCommunicationRoomSelector }

const rawChatcoopRoomMessageLineSelector = {
  originServerTs: true,
  authorLabel: true,
  coopUsername: true,
  kind: true,
  bodyText: true,
}

const _validateLine: MakeAllFieldsRequired<ValueTypes['ChatcoopRoomMessageLine']> =
  rawChatcoopRoomMessageLineSelector

export type ChatcoopRoomMessageLineModel = ModelTypes['ChatcoopRoomMessageLine']

export const chatcoopRoomMessageLineSelector = Selector('ChatcoopRoomMessageLine')(
  rawChatcoopRoomMessageLineSelector,
)
export { rawChatcoopRoomMessageLineSelector }
