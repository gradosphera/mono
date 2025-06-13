import { io, Socket } from 'socket.io-client';
import { IAction } from '../types/common';
import { wsService } from '../services';
import logger from '../config/logger';
import config from '../config/config';
import { MeetDomainInteractor } from '~/domain/meet/interactors/meet.interactor';
import type { MeetDecisionDomainInterface } from '~/domain/meet/interfaces/meet-decision-domain.interface';
import { DomainToBlockchainUtils } from '~/infrastructure/blockchain/utils/domain-to-blockchain.utils';

let clientSocket: Socket | undefined;
let meetInteractor: MeetDomainInteractor;

export const setMeetInteractor = (interactor: MeetDomainInteractor): void => {
  meetInteractor = interactor;
};

// Инициация подключения
export const initSocketConnection = (serverUrl: string): void => {
  clientSocket = io(serverUrl);

  clientSocket.on('connect', () => {
    logger.info('Success connection to notification server', { source: 'initSocketConnection' });
  });

  clientSocket.on('event', (event: IAction) => {
    processEvent(event);
  });

  clientSocket.on('connect_error', (error: Error) => {
    logger.error(`Fail connect to notification server: ${error.message}`, { source: 'initSocketConnection' });
  });
};

// Закрытие подключения
export const closeSocketConnection = (): void => {
  if (clientSocket) {
    clientSocket.disconnect();
    logger.info('Client disconnected from server', { source: 'closeSocketConnection' });
    clientSocket = undefined;
  }
};

async function processEvent(event: IAction) {
  if (event.receiver === config.coopname) {
    if (event.name === 'updateboard') {
      wsService.updateBoard(event.data);
    }

    if (event.name === 'createboard') {
      wsService.updateBoard(event.data);
    }

    if (event.name === 'newgdecision') {
      // Обработка события о решении собрания
      try {
        // Преобразуем блокчейн-документ в формат ISignedDocumentDomainInterface
        const decisionDocument = DomainToBlockchainUtils.convertChainDocumentToSignedDocument2(event.data.decision);

        // Нормализуем числовые значения
        const decisionData: MeetDecisionDomainInterface = {
          ...event.data,
          signed_ballots: Number(event.data.signed_ballots),
          quorum_percent: Number(event.data.quorum_percent),
          results: event.data.results.map((item) => ({
            ...item,
            question_id: Number(item.question_id),
            number: Number(item.number),
            votes_for: Number(item.votes_for),
            votes_against: Number(item.votes_against),
            votes_abstained: Number(item.votes_abstained),
          })),
          decision: decisionDocument, // Документ решения из блокчейна
        };

        // Используем интерактор для сохранения данных о завершенном собрании
        await meetInteractor.processMeetDecision({
          action: event,
          decisionData,
        });

        logger.info(`Processed meet decision for ${event.data.hash}`, { source: 'processEvent' });
      } catch (error: any) {
        logger.error(`Error processing meet decision: ${error.message}`, { source: 'processEvent', error });
      }
    }
  }
}
