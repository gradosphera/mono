import type { Queries, Mutations, Zeus } from '@coopenomics/sdk';

export type IAvailableReport =
  Queries.Reports.GetAvailableReports.IOutput[typeof Queries.Reports.GetAvailableReports.name][number];

export type IGeneratedReport =
  Queries.Reports.GetReport.IOutput[typeof Queries.Reports.GetReport.name];

export type IReportHistoryPage =
  Queries.Reports.GetReportHistory.IOutput[typeof Queries.Reports.GetReportHistory.name];

export type IReportRequisitesView =
  Queries.Reports.GetReportRequisites.IOutput[typeof Queries.Reports.GetReportRequisites.name];

export type IReportReadinessView =
  Queries.Reports.CheckReportReadiness.IOutput[typeof Queries.Reports.CheckReportReadiness.name];

export type IReportDraft =
  Queries.Reports.GetReportDraft.IOutput[typeof Queries.Reports.GetReportDraft.name];

export type IFieldError =
  Queries.Reports.ValidateReportEdits.IOutput[typeof Queries.Reports.ValidateReportEdits.name][number];

export type IBuildInitialReportEdits =
  Queries.Reports.BuildInitialReportEdits.IOutput[typeof Queries.Reports.BuildInitialReportEdits.name];

export type IReportHistoryFilterInput = Zeus.ModelTypes['ReportHistoryFilterInput'];
export type IUpdateReportRequisitesInput = Zeus.ModelTypes['UpdateReportRequisitesInput'];
export type IReportType = Zeus.ModelTypes['ReportType'];
export type IListReportDraftsFilterInput = Zeus.ModelTypes['ListReportDraftsFilterInput'];
export type ISaveReportDraftInput = Zeus.ModelTypes['SaveReportDraftInput'];
