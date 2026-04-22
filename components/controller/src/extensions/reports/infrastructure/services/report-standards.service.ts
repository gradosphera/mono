import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import { basename, join, resolve } from 'path';
import iconv from 'iconv-lite';
import { ReportType, REPORT_CONFIG } from '../../domain/enums/report-type.enum';

/**
 * Резолвим путь к schemas/ (под ts-node и dist/). Повторяет логику
 * `xsd-validator.service.ts` — один и тот же набор кандидатов, чтобы
 * сервисы вели себя одинаково в dev/prod.
 */
function resolveSchemasDir(): string {
  const envOverride = process.env.REPORTS_SCHEMAS_DIR;
  if (envOverride && existsSync(envOverride)) return resolve(envOverride);
  const candidates = [
    join(__dirname, '..', '..', 'schemas'),
    join(__dirname, '..', '..', '..', 'src', 'extensions', 'reports', 'schemas'),
    join(process.cwd(), 'src', 'extensions', 'reports', 'schemas'),
    join(process.cwd(), 'components', 'controller', 'src', 'extensions', 'reports', 'schemas'),
  ];
  for (const c of candidates) if (existsSync(c)) return resolve(c);
  return candidates[0];
}

/**
 * reports-standarts/ — sibling-папка с официальными бланками ФНС/СФР
 * (PDF/TIF/XLS). Репо монорепо, папка всегда на уровне components/.
 */
function resolveStandartsDir(): string {
  const envOverride = process.env.REPORTS_STANDARTS_DIR;
  if (envOverride && existsSync(envOverride)) return resolve(envOverride);
  const candidates = [
    join(__dirname, '..', '..', '..', '..', '..', '..', 'reports-standarts'),
    join(process.cwd(), 'components', 'reports-standarts'),
    join(process.cwd(), '..', 'reports-standarts'),
  ];
  for (const c of candidates) if (existsSync(c)) return resolve(c);
  return candidates[0];
}

const SCHEMAS_DIR = resolveSchemasDir();
const STANDARTS_DIR = resolveStandartsDir();

const CP1251_ENCODING_RE = /encoding\s*=\s*(['"])\s*(windows-1251|cp1251|cp-1251)\s*\1/i;

/**
 * Маппинг ReportType → PDF-бланк из reports-standarts. Папки — кириллицей,
 * как на диске. Файлы — точные имена после `git mv`. Нет PDF для UUSN
 * (бланк есть только как TIF) — пока отдаём UT_UVISCHSUMNAL-файл, как и для
 * UV_VZNOSY (обе формы используют один XSD).
 */
const PDF_BLANK_MAP: Partial<Record<ReportType, { folder: string; file: string }>> = {
  [ReportType.BUHOTCH]: {
    folder: 'Бухбаланс',
    file: 'blank_0710096_uproshennaya_buhotchetnost.pdf',
  },
  [ReportType.DUSN]: {
    folder: 'ДУСН',
    file: 'format_ed-7-3-1017_data_26.11.2025.pdf',
  },
  [ReportType.NDFL6]: {
    folder: '6-НДФЛ',
    file: 'pril1_ed-7-11-877_data_18.10.2024.pdf',
  },
  [ReportType.PSV]: {
    folder: 'ПСВ',
    file: 'format_NO_PERSSVFL_1_297_00_05_01.pdf',
  },
  [ReportType.UV_VZNOSY]: {
    folder: 'Уведомление об исчисленных взносах',
    file: 'format_ed-7-8-1047_data_02.11.2022.pdf',
  },
  [ReportType.UUSN]: {
    folder: 'Уведомление об исчисленных взносах',
    file: 'format_ed-7-8-1047_data_02.11.2022.pdf',
  },
  [ReportType.FSS4]: {
    folder: '4ФСС-ЕФС-1',
    file: 'Prilojenie_1232305_1673262677503.pdf',
  },
  // RSV: в reports-standarts лежит только .docx (format_bs-4-11-...), PDF-бланка
  // у ФНС в открытом виде нет. На этапе вёрстки RsvForm — генерируем PDF из Vue.
};

/**
 * Возвращает XSD-схему и PDF-бланк для указанного типа отчёта. XSD читается
 * из `schemas/`, при необходимости перекодируется cp1251→utf-8. PDF читается
 * из `components/reports-standarts/` как бинарник, отдаётся наружу в base64.
 */
@Injectable()
export class ReportStandardsService {
  private readonly logger = new Logger(ReportStandardsService.name);

  async getXsd(reportType: ReportType): Promise<{ content: string; fileName: string }> {
    const cfg = REPORT_CONFIG[reportType];
    if (!cfg?.xsdFile) {
      throw new NotFoundException(`XSD для типа отчёта ${reportType} не сконфигурирована`);
    }
    const absPath = join(SCHEMAS_DIR, cfg.xsdFile);
    if (!existsSync(absPath)) {
      throw new NotFoundException(`XSD-файл не найден: ${cfg.xsdFile}`);
    }
    const buf = await readFile(absPath);
    const head = buf.slice(0, 200).toString('utf-8');
    const isCp1251 = CP1251_ENCODING_RE.test(head);
    const decoded = isCp1251 ? iconv.decode(buf, 'win1251') : buf.toString('utf-8');
    // Перезаписываем объявление кодировки на utf-8 — чтобы скачанный файл
    // корректно открывался в редакторах без двойной перекодировки.
    const content = decoded.replace(CP1251_ENCODING_RE, 'encoding="utf-8"');
    return { content, fileName: basename(cfg.xsdFile) };
  }

  async getBlankPdf(reportType: ReportType): Promise<{ content: string; fileName: string; mimeType: string }> {
    const mapping = PDF_BLANK_MAP[reportType];
    if (!mapping) {
      throw new NotFoundException(
        `PDF-бланк для типа отчёта ${reportType} недоступен. Формы РСВ сейчас в формате .docx — будет добавлено позже.`,
      );
    }
    const absPath = join(STANDARTS_DIR, mapping.folder, mapping.file);
    if (!existsSync(absPath)) {
      throw new NotFoundException(`PDF-бланк не найден на диске: ${mapping.folder}/${mapping.file}`);
    }
    const buf = await readFile(absPath);
    return {
      content: buf.toString('base64'),
      fileName: mapping.file,
      mimeType: 'application/pdf',
    };
  }
}
