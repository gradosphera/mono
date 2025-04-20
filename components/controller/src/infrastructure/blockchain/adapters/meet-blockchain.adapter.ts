import { Injectable } from '@nestjs/common';
import { MeetBlockchainPort } from '~/domain/meet/ports/meet-blockchain.port';
import { BlockchainService } from '../blockchain.service';
import { MeetContract } from 'cooptypes';
import { TransactResult } from '@wharfkit/session';
import Vault from '~/models/vault.model';
import httpStatus from 'http-status';
import { HttpApiError } from '~/errors/http-api-error';
import type { TransactionResult } from '~/domain/blockchain/types/transaction-result.type';
import { VoteOnAnnualGeneralMeetInputDomainInterface } from '~/domain/meet/interfaces/vote-on-annual-general-meet-input.interface';
import { RestartAnnualGeneralMeetInputDomainInterface } from '~/domain/meet/interfaces/restart-annual-general-meet-input-domain.interface';
import { CloseAnnualGeneralMeetInputDomainInterface } from '~/domain/meet/interfaces/close-annual-general-meet-input-domain.interface';
import { CreateAnnualGeneralMeetInputDomainInterface } from '~/domain/meet/interfaces/create-annual-meet-input-domain.interface';
import { DomainToBlockchainUtils } from '../utils/domain-to-blockchain.utils';
import { GetMeetInputDomainInterface } from '~/domain/meet/interfaces/get-meet-input-domain.interface';
import { GetMeetsInputDomainInterface } from '~/domain/meet/interfaces/get-meets-input-domain.interface';
import { MeetProcessingDomainEntity } from '~/domain/meet/entities/meet-processing-domain.entity';
import { MeetRowProcessingDomainInterface } from '~/domain/meet/interfaces/meet-row-processing-domain.interface';
import { QuestionRowProcessingDomainInterface } from '~/domain/meet/interfaces/question-row-processing-domain.interface';

@Injectable()
export class MeetBlockchainAdapter implements MeetBlockchainPort {
  constructor(
    private readonly blockchainService: BlockchainService,
    private readonly domainToBlockchainUtils: DomainToBlockchainUtils
  ) {}

  async getMeet(data: GetMeetInputDomainInterface): Promise<MeetProcessingDomainEntity | null> {
    const { coopname, hash } = data;
    const meetData = await this.blockchainService.getSingleRow(
      MeetContract.contractName.production,
      coopname,
      MeetContract.Tables.Meets.tableName,
      hash,
      'secondary'
    );

    if (!meetData) {
      return null;
    }

    // Получаем вопросы повестки
    const questions = await this.getQuestions({ coopname, hash });

    // Преобразуем данные из блокчейна в доменную модель
    return this.convertBlockchainDataToDomainProcessing(meetData, questions);
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
        const questions = await this.getQuestions({ coopname, hash: meetData.hash });

        // Формируем обработанные данные в доменном формате
        return this.convertBlockchainDataToDomainProcessing(meetData, questions);
      })
    );

    return meetsProcessing;
  }

  async getQuestions(data: { coopname: string; hash: string }): Promise<MeetContract.Tables.Questions.IOutput[]> {
    const { coopname, hash } = data;
    const allQuestions = await this.blockchainService.query(
      MeetContract.contractName.production,
      coopname,
      MeetContract.Tables.Questions.tableName,
      {
        indexPosition: 'secondary',
        from: hash,
        to: hash,
      }
    );

    return allQuestions;
  }

  // Вспомогательный метод для преобразования данных из блокчейна в доменную модель
  private convertBlockchainDataToDomainProcessing(
    meetData: MeetContract.Tables.Meets.IOutput,
    questions: MeetContract.Tables.Questions.IOutput[]
  ): MeetProcessingDomainEntity {
    return {
      hash: meetData.hash,
      meet: this.convertBlockchainMeetToDomainMeet(meetData),
      questions: questions.map((q) => this.convertBlockchainQuestionToDomainQuestion(q)),
    } as MeetProcessingDomainEntity;
  }

  // Вспомогательный метод для преобразования данных встречи
  private convertBlockchainMeetToDomainMeet(meetData: MeetContract.Tables.Meets.IOutput): MeetRowProcessingDomainInterface {
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
      proposal: this.parseBlockchainDocument(meetData.proposal),
      authorization: this.parseBlockchainDocument(meetData.authorization),
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
  private parseBlockchainDocument(blockchainDoc: any): any {
    // Преобразование документа из формата блокчейна в формат домена
    // Здесь должна быть реализована логика разбора документа с учетом специфики домена
    return blockchainDoc;
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
    const blockchainData: MeetContract.Actions.Vote.IInput = {
      coopname: data.coopname,
      hash: data.hash,
      member: data.member,
      ballot: data.ballot,
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

  async closeMeet(data: CloseAnnualGeneralMeetInputDomainInterface): Promise<TransactionResult> {
    const wif = await Vault.getWif(data.coopname);
    if (!wif) throw new HttpApiError(httpStatus.BAD_GATEWAY, 'Не найден приватный ключ для совершения операции');

    this.blockchainService.initialize(data.coopname, wif);

    // Преобразуем доменный объект в инфраструктурный тип
    const blockchainData: MeetContract.Actions.CloseMeet.IInput = {
      coopname: data.coopname,
      hash: data.hash,
      meet_decision: this.domainToBlockchainUtils.convertSignedDocumentToBlockchainFormat(data.meet_decision),
    };

    const result = (await this.blockchainService.transact({
      account: MeetContract.contractName.production,
      name: MeetContract.Actions.CloseMeet.actionName,
      authorization: [{ actor: data.coopname, permission: 'active' }],
      data: blockchainData,
    })) as TransactResult;

    return result;
  }
}
