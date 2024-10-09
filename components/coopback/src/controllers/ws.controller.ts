import { io, Socket } from 'socket.io-client';
import { IAction } from '../types/common';
import { SovietContract } from 'cooptypes';
import { wsService } from '../services';
import logger from '../config/logger';

let clientSocket: Socket | undefined;

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
    logger.error('Fail connect to notification server', { source: 'initSocketConnection' });
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
  if (event.receiver === SovietContract.contractName.production && event.name === 'updateboard') {
    wsService.updateBoard(event.data);
  }

  if (event.receiver === SovietContract.contractName.production && event.name === 'createboard') {
    wsService.updateBoard(event.data);
  }
}
