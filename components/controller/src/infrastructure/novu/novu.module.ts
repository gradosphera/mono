import { Module } from '@nestjs/common';
import { NovuAdapter } from './novu.adapter';
import { NovuWorkflowAdapter } from './novu-workflow.adapter';
import { NovuCredentialsAdapter } from './novu-credentials.adapter';
import { NOTIFICATION_PORT } from '~/domain/notification/interfaces/notification.port';
import { NOVU_WORKFLOW_PORT } from '~/domain/notification/interfaces/novu-workflow.port';
import { NOVU_CREDENTIALS_PORT } from '~/domain/notification/interfaces/novu-credentials.port';

@Module({
  providers: [
    {
      provide: NOTIFICATION_PORT,
      useClass: NovuAdapter,
    },
    {
      provide: NOVU_WORKFLOW_PORT,
      useClass: NovuWorkflowAdapter,
    },
    {
      provide: NOVU_CREDENTIALS_PORT,
      useClass: NovuCredentialsAdapter,
    },
  ],
  exports: [NOTIFICATION_PORT, NOVU_WORKFLOW_PORT, NOVU_CREDENTIALS_PORT],
})
export class NovuModule {}
