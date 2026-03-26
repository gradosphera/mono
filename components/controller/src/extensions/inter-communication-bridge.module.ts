import { Global, Module } from '@nestjs/common';
import { INTER_PROJECT_COMMUNICATION_ARTIFACTS } from '@coopenomics/inter';
import { ChatCoopPluginModule } from './chatcoop/chatcoop-extension.module';
import { ChatcoopInterProjectCommunicationArtifactsAdapter } from './chatcoop/infrastructure/inter/chatcoop-inter-project-communication-artifacts.adapter';

/**
 * Глобальная привязка порта @coopenomics/inter к реализации ChatCoop.
 * Capital и другие расширения инжектят токен без импорта ChatCoop.
 */
@Global()
@Module({
  imports: [ChatCoopPluginModule],
  providers: [
    {
      provide: INTER_PROJECT_COMMUNICATION_ARTIFACTS,
      useExisting: ChatcoopInterProjectCommunicationArtifactsAdapter,
    },
  ],
  exports: [INTER_PROJECT_COMMUNICATION_ARTIFACTS],
})
export class InterCommunicationBridgeModule {}
