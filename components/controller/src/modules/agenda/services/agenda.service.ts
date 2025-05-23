import { Injectable } from '@nestjs/common';
import { AgendaWithDocumentsDTO } from '../dto/agenda-with-documents.dto';
import { AgendaDomainInteractor } from '~/domain/agenda/interactors/agenda-domain.interactor';

@Injectable()
export class AgendaService {
  constructor(private readonly agendaDomainInteractor: AgendaDomainInteractor) {}

  public async getAgenda(): Promise<AgendaWithDocumentsDTO[]> {
    const agenda = await this.agendaDomainInteractor.getAgenda();
    return agenda.map((item) => new AgendaWithDocumentsDTO(item));
  }
}
