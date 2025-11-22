import type { MakeAllFieldsRequired } from '../../utils/MakeAllFieldsRequired'
import { Selector, type ValueTypes } from '../../zeus/index'
import { extensionLogSelector } from './extensionLogSelector'

export const rawPaginatedExtensionLogsSelector = {
  items: extensionLogSelector,
  totalCount: true,
  totalPages: true,
  currentPage: true,
}

const _validate: MakeAllFieldsRequired<ValueTypes['ExtensionLogsPaginationResult']> = rawPaginatedExtensionLogsSelector

export const paginatedExtensionLogsSelector = Selector('ExtensionLogsPaginationResult')(rawPaginatedExtensionLogsSelector)
