import type { MakeAllFieldsRequired } from '../../utils/MakeAllFieldsRequired'
import { paginationSelector } from '../../utils/paginationSelector'
import { type ModelTypes, Selector, type ValueTypes } from '../../zeus/index'
import { rawApprovalSelector } from './approvalSelector'

// Пагинированный селектор для одобрений
const rawApprovalsPaginationSelector = { ...paginationSelector, items: rawApprovalSelector }
const _validateApprovals: MakeAllFieldsRequired<ValueTypes['PaginatedChairmanApprovalsPaginationResult']> = rawApprovalsPaginationSelector
export type approvalsPaginationModel = ModelTypes['PaginatedChairmanApprovalsPaginationResult']
export const approvalsPaginationSelector = Selector('PaginatedChairmanApprovalsPaginationResult')(rawApprovalsPaginationSelector)
