import type { Queries, Zeus } from '@coopenomics/sdk';

// Типы для пагинированных соглашений
export type IPaginatedAgreementsResponse =
  Queries.Agreements.Agreements.IOutput[typeof Queries.Agreements.Agreements.name];
export type ILoadPaginatedAgreementsInput = Queries.Agreements.Agreements.IInput;

// Типы для фильтрации и пагинации
export type IAgreementFilter = Zeus.ModelTypes['AgreementFilter'];
export type IPaginationInput = Zeus.ModelTypes['PaginationInput'];

// Тип для отдельного соглашения
export type IAgreement = Zeus.ModelTypes['Agreement'];
