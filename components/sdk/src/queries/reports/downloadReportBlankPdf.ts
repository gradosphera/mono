import { rawReportBlankFileSelector } from '../../selectors/reports/reportBlankFileSelector'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'downloadReportBlankPdf'

export const query = Selector('Query')({
  [name]: [{ reportType: $('reportType', 'ReportType!') }, rawReportBlankFileSelector],
})

export interface IInput {
  [key: string]: unknown

  reportType: ModelTypes['ReportType']
}

export type IOutput = InputType<GraphQLTypes['Query'], typeof query>
