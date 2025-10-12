import type { Queries, Zeus } from '@coopenomics/sdk';

// Тип сегмента
export type ISegment = Zeus.ModelTypes['CapitalSegment'];

// Тип пагинированного списка сегментов
export type ISegmentsPagination =
  Queries.Capital.GetSegments.IOutput[typeof Queries.Capital.GetSegments.name];

// Тип входных параметров для получения сегментов
export type IGetSegmentsInput = Queries.Capital.GetSegments.IInput;

// Тип входных параметров для получения одного сегмента
export type IGetSegmentInput = Queries.Capital.GetSegment.IInput;
