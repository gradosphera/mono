import { Injectable } from '@nestjs/common';
import { MeetBlockchainPort } from '~/domain/meet/ports/meet-blockchain.port';
import { BlockchainService } from '../blockchain.service';
import { MeetContract, type Cooperative } from 'cooptypes';
import { Checksum256, TransactResult } from '@wharfkit/session';
import Vault from '~/models/vault.model';
import httpStatus from 'http-status';
import { HttpApiError } from '~/errors/http-api-error';
import type { TransactionResult } from '~/domain/blockchain/types/transaction-result.type';
import { VoteOnAnnualGeneralMeetInputDomainInterface } from '~/domain/meet/interfaces/vote-on-annual-general-meet-input.interface';
import { RestartAnnualGeneralMeetInputDomainInterface } from '~/domain/meet/interfaces/restart-annual-general-meet-input-domain.interface';
import { CreateAnnualGeneralMeetInputDomainInterface } from '~/domain/meet/interfaces/create-annual-meet-input-domain.interface';
import { DomainToBlockchainUtils } from '../utils/domain-to-blockchain.utils';
import { GetMeetInputDomainInterface } from '~/domain/meet/interfaces/get-meet-input-domain.interface';
import { GetMeetsInputDomainInterface } from '~/domain/meet/interfaces/get-meets-input-domain.interface';
import { MeetProcessingDomainEntity } from '~/domain/meet/entities/meet-processing-domain.entity';
import { MeetRowProcessingDomainInterface } from '~/domain/meet/interfaces/meet-row-processing-domain.interface';
import { QuestionRowProcessingDomainInterface } from '~/domain/meet/interfaces/question-row-processing-domain.interface';
import { DocumentAggregator } from '~/domain/document/aggregators/document.aggregator';
import { SignBySecretaryOnAnnualGeneralMeetInputDomainInterface } from '~/domain/meet/interfaces/sign-by-secretary-on-annual-general-meet-input-domain.interface';
import { SignByPresiderOnAnnualGeneralMeetInputDomainInterface } from '~/domain/meet/interfaces/sign-by-presider-on-annual-general-meet-input-domain.interface';

@Injectable()
export class MeetBlockchainAdapter implements MeetBlockchainPort {
  constructor(
    private readonly blockchainService: BlockchainService,
    private readonly domainToBlockchainUtils: DomainToBlockchainUtils,
    private readonly documentAggregator: DocumentAggregator
  ) {}

  async getMeet(data: GetMeetInputDomainInterface): Promise<MeetProcessingDomainEntity | null> {
    const { coopname, hash } = data;

    const meetData = await this.blockchainService.getSingleRow(
      MeetContract.contractName.production,
      coopname,
      MeetContract.Tables.Meets.tableName,
      Checksum256.from(hash),
      'secondary',
      'sha256'
    );

    if (!meetData) {
      return null;
    }

    // Получаем вопросы повестки
    const questions = await this.getQuestions({ coopname, meetId: meetData.id });
    // Преобразуем данные из блокчейна в доменную модель
    return await this.convertBlockchainDataToDomainProcessing(meetData, questions);
  }

  async getMeets(data: GetMeetsInputDomainInterface): Promise<MeetProcessingDomainEntity[]> {
    const { coopname } = data;
    const meetsData = await this.blockchainService.getAllRows(
      MeetContract.contractName.production,
      coopname,
      MeetContract.Tables.Meets.tableName
    );

    if (!meetsData || meetsData.length === 0) {
      return [];
    }

    // Преобразуем данные в домен
    const meetsProcessing = await Promise.all(
      meetsData.map(async (meetData) => {
        // Получаем вопросы повестки для каждого собрания
        const questions = await this.getQuestions({ coopname, meetId: meetData.id });

        // Формируем обработанные данные в доменном формате
        return await this.convertBlockchainDataToDomainProcessing(meetData, questions);
      })
    );

    return meetsProcessing;
  }

  async getQuestions(data: { coopname: string; meetId: string }): Promise<MeetContract.Tables.Questions.IOutput[]> {
    const { coopname, meetId } = data;
    const allQuestions = await this.blockchainService.query(
      MeetContract.contractName.production,
      coopname,
      MeetContract.Tables.Questions.tableName,
      {
        indexPosition: 'secondary',
        from: meetId,
        to: meetId,
      }
    );
    return allQuestions;
  }

  // Вспомогательный метод для преобразования данных из блокчейна в доменную модель
  private async convertBlockchainDataToDomainProcessing(
    meetData: MeetContract.Tables.Meets.IOutput,
    questions: MeetContract.Tables.Questions.IOutput[]
  ): Promise<MeetProcessingDomainEntity> {
    const data = {
      hash: meetData.hash,
      meet: await this.convertBlockchainMeetToDomainMeet(meetData),
      questions: questions.map((q) => this.convertBlockchainQuestionToDomainQuestion(q)),
    };
    return data;
  }

  // Вспомогательный метод для преобразования данных встречи
  private async convertBlockchainMeetToDomainMeet(
    meetData: MeetContract.Tables.Meets.IOutput
  ): Promise<MeetRowProcessingDomainInterface> {
    return {
      id: Number(meetData.id),
      hash: meetData.hash,
      coopname: meetData.coopname,
      type: meetData.type,
      initiator: meetData.initiator,
      presider: meetData.presider,
      secretary: meetData.secretary,
      status: meetData.status,
      created_at: new Date(meetData.created_at),
      open_at: new Date(meetData.open_at),
      close_at: new Date(meetData.close_at),
      quorum_percent: Number(meetData.quorum_percent),
      signed_ballots: Number(meetData.signed_ballots),
      current_quorum_percent: Number(meetData.current_quorum_percent),
      cycle: Number(meetData.cycle),
      quorum_passed: meetData.quorum_passed,
      proposal:
        meetData.proposal.hash !== '0000000000000000000000000000000000000000000000000000000000000000'
          ? await this.parseBlockchainDocument(meetData.proposal)
          : null,
      authorization:
        meetData.authorization.hash !== '0000000000000000000000000000000000000000000000000000000000000000'
          ? await this.parseBlockchainDocument(meetData.authorization)
          : null,
    };
  }

  // Вспомогательный метод для преобразования данных вопроса
  private convertBlockchainQuestionToDomainQuestion(
    questionData: MeetContract.Tables.Questions.IOutput
  ): QuestionRowProcessingDomainInterface {
    return {
      id: Number(questionData.id),
      number: Number(questionData.number),
      meet_id: Number(questionData.meet_id),
      coopname: questionData.coopname,
      title: questionData.title,
      context: questionData.context,
      decision: questionData.decision,
      counter_votes_for: Number(questionData.counter_votes_for),
      counter_votes_against: Number(questionData.counter_votes_against),
      counter_votes_abstained: Number(questionData.counter_votes_abstained),
      voters_for: questionData.voters_for,
      voters_against: questionData.voters_against,
      voters_abstained: questionData.voters_abstained,
    };
  }

  // Вспомогательный метод для разбора блокчейн-документа
  private async parseBlockchainDocument(blockchainDoc: Cooperative.Document.IChainDocument): Promise<any> {
    try {
      if (!blockchainDoc || !blockchainDoc.hash) {
        return blockchainDoc;
      }

      // Конвертируем в формат ISignedDocument
      const signedDocument: Cooperative.Document.ISignedDocument = {
        hash: blockchainDoc.hash,
        public_key: blockchainDoc.public_key,
        signature: blockchainDoc.signature,
        meta: typeof blockchainDoc.meta === 'string' ? JSON.parse(blockchainDoc.meta) : blockchainDoc.meta,
      };

      // Создаем агрегат документа с помощью документного агрегатора
      const result = await this.documentAggregator.buildDocumentAggregate(signedDocument);
      return result;
    } catch (error) {
      console.error(`parseBlockchainDocument: ОШИБКА при обработке документа:`, error);
      throw error; // Перебрасываем ошибку выше для дальнейшей обработки
    }
  }

  async createMeet(data: CreateAnnualGeneralMeetInputDomainInterface): Promise<TransactionResult> {
    const wif = await Vault.getWif(data.coopname);
    if (!wif) throw new HttpApiError(httpStatus.BAD_GATEWAY, 'Не найден приватный ключ для совершения операции');

    this.blockchainService.initialize(data.coopname, wif);

    // Преобразуем доменный объект в инфраструктурный тип
    const blockchainData: MeetContract.Actions.CreateMeet.IInput = {
      ...data,
      proposal: this.domainToBlockchainUtils.convertSignedDocumentToBlockchainFormat(data.proposal),
      open_at: this.domainToBlockchainUtils.convertDateToBlockchainFormat(data.open_at),
      close_at: this.domainToBlockchainUtils.convertDateToBlockchainFormat(data.close_at),
    };

    const result = (await this.blockchainService.transact({
      account: MeetContract.contractName.production,
      name: MeetContract.Actions.CreateMeet.actionName,
      authorization: [{ actor: data.coopname, permission: 'active' }],
      data: blockchainData,
    })) as TransactResult;

    return result;
  }

  async vote(data: VoteOnAnnualGeneralMeetInputDomainInterface): Promise<TransactionResult> {
    const wif = await Vault.getWif(data.coopname);
    if (!wif) throw new HttpApiError(httpStatus.BAD_GATEWAY, 'Не найден приватный ключ для совершения операции');

    this.blockchainService.initialize(data.coopname, wif);

    // Преобразуем доменный объект в инфраструктурный тип
    const blockchainData = {
      coopname: data.coopname,
      hash: data.hash,
      member: data.member,
      ballot: this.domainToBlockchainUtils.convertSignedDocumentToBlockchainFormat(data.ballot),
      votes: data.votes,
    };

    const result = (await this.blockchainService.transact({
      account: MeetContract.contractName.production,
      name: MeetContract.Actions.Vote.actionName,
      authorization: [{ actor: data.coopname, permission: 'active' }],
      data: blockchainData,
    })) as TransactResult;

    return result;
  }

  async restartMeet(data: RestartAnnualGeneralMeetInputDomainInterface): Promise<TransactionResult> {
    const wif = await Vault.getWif(data.coopname);
    if (!wif) throw new HttpApiError(httpStatus.BAD_GATEWAY, 'Не найден приватный ключ для совершения операции');

    this.blockchainService.initialize(data.coopname, wif);

    // Преобразуем доменный объект в инфраструктурный тип
    const blockchainData: MeetContract.Actions.RestartMeet.IInput = {
      coopname: data.coopname,
      hash: data.hash,
      newproposal: this.domainToBlockchainUtils.convertSignedDocumentToBlockchainFormat(data.newproposal),
      new_open_at: this.domainToBlockchainUtils.convertDateToBlockchainFormat(data.new_open_at),
      new_close_at: this.domainToBlockchainUtils.convertDateToBlockchainFormat(data.new_close_at),
    };

    const result = (await this.blockchainService.transact({
      account: MeetContract.contractName.production,
      name: MeetContract.Actions.RestartMeet.actionName,
      authorization: [{ actor: data.coopname, permission: 'active' }],
      data: blockchainData,
    })) as TransactResult;

    return result;
  }

  async signBySecretaryOnAnnualGeneralMeet(
    data: SignBySecretaryOnAnnualGeneralMeetInputDomainInterface
  ): Promise<TransactionResult> {
    const wif = await Vault.getWif(data.coopname);
    if (!wif) throw new HttpApiError(httpStatus.BAD_GATEWAY, 'Не найден приватный ключ для совершения операции');

    this.blockchainService.initialize(data.coopname, wif);

    const blockchainData: MeetContract.Actions.SignBySecretary.IInput = {
      coopname: data.coopname,
      hash: data.hash,
      secretary_decision: this.domainToBlockchainUtils.convertSignedDocumentToBlockchainFormat(data.secretary_decision),
    };

    const result = (await this.blockchainService.transact({
      account: MeetContract.contractName.production,
      name: MeetContract.Actions.SignBySecretary.actionName,
      authorization: [{ actor: data.coopname, permission: 'active' }],
      data: blockchainData,
    })) as TransactResult;

    return result;
  }

  async signByPresiderOnAnnualGeneralMeet(
    data: SignByPresiderOnAnnualGeneralMeetInputDomainInterface
  ): Promise<TransactionResult> {
    const wif = await Vault.getWif(data.coopname);
    if (!wif) throw new HttpApiError(httpStatus.BAD_GATEWAY, 'Не найден приватный ключ для совершения операции');

    this.blockchainService.initialize(data.coopname, wif);

    const blockchainData: MeetContract.Actions.SignByPresider.IInput = {
      coopname: data.coopname,
      hash: data.hash,
      presider_decision: this.domainToBlockchainUtils.convertSignedDocumentToBlockchainFormat(data.presider_decision),
    };

    const result = (await this.blockchainService.transact({
      account: MeetContract.contractName.production,
      name: MeetContract.Actions.SignByPresider.actionName,
      authorization: [{ actor: data.coopname, permission: 'active' }],
      data: blockchainData,
    })) as TransactResult;

    return result;
  }
}
