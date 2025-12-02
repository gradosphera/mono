import { oneCoopDocumentSelector } from './oneCoopDocumentSelector'

export const oneCoopDocumentsPaginationSelector = {
  items: oneCoopDocumentSelector,
  total_count: true,
  total_pages: true,
  current_page: true,
  max_block_num: true,
}
