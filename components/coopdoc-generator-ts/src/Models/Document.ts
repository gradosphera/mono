import type { IMetaDocument } from '../Interfaces'

export interface Document {
  full_title?: string
  html: string
  hash: string
  meta: IMetaDocument
  binary: Uint8Array
}
