import { defineStore } from 'pinia';
import { ref, reactive } from 'vue';
import { reportApi } from '../api';
import type {
  IAvailableReport,
  IGeneratedReport,
  IGenerateReportInput,
  IReportHistoryFilterInput,
  IReportHistoryPage,
  IReportReadinessView,
  IReportRequisitesView,
  IReportType,
  IOrganizationDataInput,
  IUpdateReportRequisitesInput,
} from '../types';

const namespace = 'report';

export const useReportStore = defineStore(namespace, () => {
  const reports = ref<IAvailableReport[]>([]);
  const loading = ref(false);

  const archive = reactive<{ items: IReportHistoryPage['items']; total: number }>({
    items: [],
    total: 0,
  });
  const archiveLoading = ref(false);

  // Sequence-guard: быстрая навигация/смена фильтров пушит несколько запросов,
  // ответы могут прийти не в том порядке. Рендерим только последний.
  let lastArchiveRequestId = 0;

  async function loadReports(): Promise<void> {
    loading.value = true;
    try {
      reports.value = await reportApi.getAvailableReports();
    } finally {
      loading.value = false;
    }
  }

  async function loadArchive(filter: IReportHistoryFilterInput = {}): Promise<boolean> {
    const myId = ++lastArchiveRequestId;
    archiveLoading.value = true;
    try {
      const page = await reportApi.getReportHistory(filter);
      if (myId !== lastArchiveRequestId) return false;
      archive.items = page?.items ?? [];
      archive.total = page?.total ?? 0;
      return true;
    } finally {
      if (myId === lastArchiveRequestId) archiveLoading.value = false;
    }
  }

  async function getReport(id: string): Promise<IGeneratedReport | undefined> {
    return reportApi.getReport(id);
  }

  async function generate(
    data: IGenerateReportInput,
    organization?: IOrganizationDataInput,
  ): Promise<IGeneratedReport | undefined> {
    return reportApi.generateReport(data, organization);
  }

  async function loadRequisites(): Promise<IReportRequisitesView | undefined> {
    return reportApi.getReportRequisites();
  }

  async function updateRequisites(
    input: IUpdateReportRequisitesInput,
  ): Promise<IReportRequisitesView | undefined> {
    return reportApi.updateReportRequisites(input);
  }

  async function checkReadiness(
    reportType: IReportType,
  ): Promise<IReportReadinessView | undefined> {
    return reportApi.checkReportReadiness(reportType);
  }

  function triggerDownload(xml: string, fileName: string): void {
    // MIME без явного charset: для ФНС XML cp1251, для СФР ЕФС-1 utf-8 —
    // пусть парсер полагается на декларацию <?xml ... encoding=...?> внутри.
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName.endsWith('.xml') ? fileName : fileName + '.xml';
    // Firefox/Safari требуют элемент в DOM + отложенный revoke, иначе
    // скачивание прерывается «Network error» до захвата blob браузером.
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function triggerBinaryDownload(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function downloadXsd(reportType: IReportType): Promise<void> {
    const file = await reportApi.downloadReportXsd(reportType);
    if (!file) throw new Error('XSD не получен с сервера');
    const blob = new Blob([file.content], { type: 'application/xml; charset=utf-8' });
    triggerBinaryDownload(blob, file.fileName);
  }

  async function downloadBlankPdf(reportType: IReportType): Promise<void> {
    const file = await reportApi.downloadReportBlankPdf(reportType);
    if (!file) throw new Error('PDF-бланк не получен с сервера');
    // base64 → Uint8Array. atob работает с латиницей; контент PDF — бинарный,
    // base64 уже ASCII-safe.
    const bin = atob(file.content);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    const blob = new Blob([bytes], { type: file.mimeType });
    triggerBinaryDownload(blob, file.fileName);
  }

  return {
    reports,
    loading,
    archive,
    archiveLoading,
    loadReports,
    loadArchive,
    getReport,
    generate,
    loadRequisites,
    updateRequisites,
    checkReadiness,
    triggerDownload,
    downloadXsd,
    downloadBlankPdf,
  };
});

export type ReportTypeFilter = IReportType | null;
