import { Inject, Injectable } from '@nestjs/common';
import { AgendaWithDocumentsDTO } from '../dto/agenda-with-documents.dto';
import { AgendaDomainInteractor } from '~/domain/agenda/interactors/agenda-domain.interactor';
import {
  UserCertificateInteractor,
  USER_CERTIFICATE_INTERACTOR,
} from '~/domain/user-certificate/interactors/user-certificate.interactor';
import type { UserCertificateDomainInterface } from '~/domain/user-certificate/interfaces/user-certificate-domain.interface';

@Injectable()
export class AgendaService {
  constructor(
    private readonly agendaDomainInteractor: AgendaDomainInteractor,
    @Inject(USER_CERTIFICATE_INTERACTOR) private readonly userCertificateInteractor: UserCertificateInteractor
  ) {}

  public async getAgenda(): Promise<AgendaWithDocumentsDTO[]> {
    const agenda = await this.agendaDomainInteractor.getAgenda();

    // Обрабатываем каждый элемент повестки дня
    const processedAgenda = await Promise.all(
      agenda.map(async (item) => {
        // Получаем сертификат создателя решения
        const usernameCertificate = await this.userCertificateInteractor.getCertificateByUsername(item.table.username);

        // Получаем сертификаты для голосовавших "за"
        const votesForCertificates: UserCertificateDomainInterface[] = [];
        for (const username of item.table.votes_for) {
          const certificate = await this.userCertificateInteractor.getCertificateByUsername(username);
          if (certificate) {
            votesForCertificates.push(certificate);
          }
        }

        // Получаем сертификаты для голосовавших "против"
        const votesAgainstCertificates: UserCertificateDomainInterface[] = [];
        for (const username of item.table.votes_against) {
          const certificate = await this.userCertificateInteractor.getCertificateByUsername(username);
          if (certificate) {
            votesAgainstCertificates.push(certificate);
          }
        }

        return new AgendaWithDocumentsDTO(item, usernameCertificate, votesForCertificates, votesAgainstCertificates);
      })
    );

    return processedAgenda;
  }
}
