import { Injectable } from '@nestjs/common';
import { GenerateDocumentOptionsInputDTO } from '~/application/document/dto/generate-document-options-input.dto';
import { PublishProjectFreeDecisionInputDTO } from '../dto/publish-project-free-decision-input.dto';
import type { CreateProjectFreeDecisionInputDTO } from '../dto/create-project-free-decision.dto';
import { CreatedProjectFreeDecisionDTO } from '../dto/created-project-free-decision.dto';
import { v4 } from 'uuid';
import type { FreeDecisionGenerateDocumentInputDTO } from '../../document/documents-dto/free-decision-document.dto';
import { FreeDecisionInteractor } from '~/application/free-decision/interactors/free-decision.interactor';
import type { ProjectFreeDecisionGenerateDocumentInputDTO } from '~/application/document/documents-dto/project-free-decision-document.dto';
import type { GeneratedDocumentDTO } from '~/application/document/dto/generated-document.dto';
import { AgendaService } from '~/application/agenda/services/agenda.service';
import type { AgendaWithDocumentsDTO } from '~/application/agenda/dto/agenda-with-documents.dto';

// Повестка собирается join'ом таблицы decisions из блокчейна с
// проиндексированными парсером действием newsubmitted и документом-заявлением.
// Сразу после публикации парсер ещё не успел проиндексировать, поэтому даём
// settle-паузу и забираем готовый вопрос с повестки (с короткой страховочной
// петлёй на случай чуть большего лага), чтобы вернуть его фронту немедленно.
const PUBLISH_FETCH_DELAY_MS = 1000;
const PUBLISH_FETCH_ATTEMPTS = 4;

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

@Injectable()
export class FreeDecisionService {
  constructor(
    private readonly freeDecisionInteractor: FreeDecisionInteractor,
    private readonly agendaService: AgendaService
  ) {}

  public async generateProjectOfFreeDecision(
    data: ProjectFreeDecisionGenerateDocumentInputDTO,
    options: GenerateDocumentOptionsInputDTO
  ): Promise<GeneratedDocumentDTO> {
    const document = await this.freeDecisionInteractor.generateProjectOfFreeDecisionDocument(data, options);
    //TODO чтобы избавиться от unknown необходимо строго типизировать ответ фабрики документов
    return document as unknown as GeneratedDocumentDTO;
  }

  public async generateFreeDecision(
    data: FreeDecisionGenerateDocumentInputDTO,
    options: GenerateDocumentOptionsInputDTO
  ): Promise<GeneratedDocumentDTO> {
    const document = await this.freeDecisionInteractor.generateFreeDecisionDocument(data, options);
    //TODO чтобы избавиться от unknown необходимо строго типизировать ответ фабрики документов
    return document as unknown as GeneratedDocumentDTO;
  }

  public async publishProjectOfFreeDecision(
    data: PublishProjectFreeDecisionInputDTO
  ): Promise<AgendaWithDocumentsDTO | null> {
    await this.freeDecisionInteractor.publishProjectOfFreeDecision(data);

    // Хэш документа-заявления == hash решения в таблице decisions блокчейна.
    const hash = data.document.doc_hash;

    let item: AgendaWithDocumentsDTO | null = null;
    for (let attempt = 0; attempt < PUBLISH_FETCH_ATTEMPTS; attempt++) {
      await sleep(PUBLISH_FETCH_DELAY_MS);
      item = await this.agendaService.getAgendaItemByHash(hash);
      if (item) break;
    }

    // null допустим: если парсер не успел проиндексировать — фронт покажет вопрос
    // на ближайшем тике поллинга (деградация, не ошибка).
    return item;
  }

  public async createProjectOfFreeDecision(data: CreateProjectFreeDecisionInputDTO): Promise<CreatedProjectFreeDecisionDTO> {
    const id = v4();
    const project = await this.freeDecisionInteractor.createProjectOfFreeDecision({ ...data, id });
    return new CreatedProjectFreeDecisionDTO(project);
  }
}
