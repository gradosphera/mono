import { io, Socket } from 'socket.io-client';
import { IAction } from '../types/common';
import { wsService } from '../services';
import logger from '../config/logger';
import config from '../config/config';
import { MeetDomainInteractor } from '~/domain/meet/interactors/meet.interactor';
import { LedgerDomainInteractor } from '~/domain/ledger/interactors/ledger.interactor';
import type { MeetDecisionDomainInterface } from '~/domain/meet/interfaces/meet-decision-domain.interface';
import { DomainToBlockchainUtils } from '~/infrastructure/blockchain/utils/domain-to-blockchain.utils';
import { NotificationSenderService } from '~/modules/notification/services/notification-sender.service';
import { Workflows } from '@coopenomics/notifications';
import User from '~/models/user.model';
import type { TokenContract } from 'cooptypes';
import { nestApp } from '~/index';

let clientSocket: Socket | undefined;
let meetInteractor: MeetDomainInteractor;
let ledgerInteractor: LedgerDomainInteractor;

export const setMeetInteractor = (interactor: MeetDomainInteractor): void => {
  meetInteractor = interactor;
};

export const setLedgerInteractor = (interactor: LedgerDomainInteractor): void => {
  ledgerInteractor = interactor;
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

    // Обработка событий операций ledger
    const ledgerActions = ['debet', 'credit', 'block', 'unblock', 'writeoff', 'writeoffcnsl'];
    if (ledgerActions.includes(event.name)) {
      try {
        if (ledgerInteractor) {
          await ledgerInteractor.processLedgerEvent(event);
          logger.info('Ledger operation processed successfully', {
            source: 'processEvent',
            action: event.name,
            coopname: event.data.coopname,
            global_sequence: event.global_sequence,
          });
        } else {
          logger.warn('LedgerInteractor not available for ledger event processing', {
            source: 'processEvent',
            action: event.name,
          });
        }
      } catch (error: any) {
        logger.error('Failed to process ledger operation event', {
          source: 'processEvent',
          error: error.message,
          stack: error.stack,
          event,
        });
      }
    }
  }

  if (event.name === 'transfer' && event.receiver === 'eosio.token') {
    console.log('transfer', event);

    // Отправляем уведомление о входящем переводе
    try {
      await sendIncomingTransferNotification(event);
    } catch (error: any) {
      logger.error(`Ошибка отправки уведомления о входящем переводе: ${error.message}`, { source: 'processEvent', error });
    }
  }
}

/**
 * Отправляет уведомление о входящем переводе
 * @param event Событие transfer из блокчейна
 */
async function sendIncomingTransferNotification(event: IAction): Promise<void> {
  // Получаем NotificationSenderService из NestJS приложения
  let notificationSender: NotificationSenderService;
  try {
    notificationSender = nestApp.get(NotificationSenderService);
  } catch (error: any) {
    logger.warn('Не удалось получить NotificationSenderService, пропускаем уведомление о переводе', {
      error: error.message,
    });
    return;
  }

  // Извлекаем данные перевода из события
  const transferData = event.data as TokenContract.Actions.Transfer.ITransfer;

  if (!transferData.to || !transferData.quantity) {
    logger.warn('Неполные данные в событии transfer, пропускаем уведомление', { transferData });
    return;
  }

  const recipientUsername = transferData.to;
  const transferAmount = transferData.quantity;

  logger.info(`Обработка уведомления о переводе для пользователя: ${recipientUsername}, сумма: ${transferAmount}`);

  try {
    // Ищем пользователя по username
    const user = await User.findOne({ username: recipientUsername });

    if (!user) {
      logger.info(`Пользователь ${recipientUsername} не найден в базе данных, пропускаем уведомление`);
      return;
    }

    // Если у пользователя нет subscriber_id, пропускаем уведомление
    if (!user.subscriber_id) {
      logger.info(`У пользователя ${recipientUsername} нет subscriber_id, пропускаем уведомление`);
      return;
    }

    // Подготавливаем payload для уведомления согласно схеме из @coopenomics/notifications
    const notificationPayload: Workflows.NewTransfer.IPayload = {
      quantity: transferAmount,
    };

    // Отправляем уведомление используя воркфлоу из пакета @coopenomics/notifications
    await notificationSender.sendNotificationToUser(
      recipientUsername,
      Workflows.NewTransfer.workflow.workflowId, // 'vkhodyaschiy-perevod'
      notificationPayload
    );

    logger.info(`Уведомление о входящем переводе отправлено пользователю: ${recipientUsername}`);
  } catch (error: any) {
    logger.error(`Ошибка при отправке уведомления о переводе пользователю ${recipientUsername}: ${error.message}`, {
      error,
    });
    // Не перебрасываем ошибку, чтобы не прерывать обработку других событий
  }
}
