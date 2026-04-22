import type { MakeAllFieldsRequired } from '../../utils/MakeAllFieldsRequired'
import { type ModelTypes, Selector, type ValueTypes } from '../../zeus/index'

export const rawReportBlankFileSelector = {
  content: true,
  fileName: true,
  mimeType: true,
}

const _validate: MakeAllFieldsRequired<ValueTypes['ReportBlankFile']> = rawReportBlankFileSelector

export type reportBlankFileModel = ModelTypes['ReportBlankFile']
export const reportBlankFileSelector = Selector('ReportBlankFile')(rawReportBlankFileSelector)
