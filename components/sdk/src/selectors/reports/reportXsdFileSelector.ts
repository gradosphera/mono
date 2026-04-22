import type { MakeAllFieldsRequired } from '../../utils/MakeAllFieldsRequired'
import { type ModelTypes, Selector, type ValueTypes } from '../../zeus/index'

export const rawReportXsdFileSelector = {
  content: true,
  fileName: true,
}

const _validate: MakeAllFieldsRequired<ValueTypes['ReportXsdFile']> = rawReportXsdFileSelector

export type reportXsdFileModel = ModelTypes['ReportXsdFile']
export const reportXsdFileSelector = Selector('ReportXsdFile')(rawReportXsdFileSelector)
