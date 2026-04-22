import { rawReportXsdFileSelector } from '../../selectors/reports/reportXsdFileSelector'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'downloadReportXsd'

export const query = Selector('Query')({
  [name]: [{ reportType: $('reportType', 'ReportType!') }, rawReportXsdFileSelector],
})

export interface IInput {
  [key: string]: unknown

  reportType: ModelTypes['ReportType']
}

export type IOutput = InputType<GraphQLTypes['Query'], typeof query>
