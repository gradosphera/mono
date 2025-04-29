import type { Queries } from '@coopenomics/sdk';

export type IAgenda = Queries.Agenda.GetAgenda.IOutput[typeof Queries.Agenda.GetAgenda.name][number]
export type IGetAgendaInput = Queries.Agenda.GetAgenda.IInput
