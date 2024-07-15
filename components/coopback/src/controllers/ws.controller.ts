import { io, Socket } from 'socket.io-client';
import { IAction } from '../types/common';
import { SovietContract } from 'cooptypes';
import { wsService } from '../services';

let clientSocket: Socket | undefined;

// Инициация подключения
export const initSocketConnection = (serverUrl: string): void => {
  clientSocket = io(serverUrl);

  clientSocket.on('connect', () => {
    console.log('Успешное подключение к серверу оповещений.');
  });

  clientSocket.on('event', (event: IAction) => {
    processEvent(event);
  });

  clientSocket.on('connect_error', (error: Error) => {
    console.error('Ошибка подключения к серверу оповещений:');
  });
};

// Закрытие подключения
export const closeSocketConnection = (): void => {
  if (clientSocket) {
    clientSocket.disconnect();
    console.log('Client disconnected from server');
    clientSocket = undefined;
  }
};

async function processEvent(event: IAction) {
  if (event.receiver === SovietContract.contractName.production && event.name === 'updateboard') {
    wsService.updateBoard(event.data);
  }
}
