import { Module } from '@nestjs/common';
import { MeetDomainInteractor } from './interactors/meet.interactor';
import { DocumentDomainModule } from '../document/document.module';
import { InfrastructureModule } from '~/infrastructure/infrastructure.module';
import { setMeetInteractor } from '~/controllers/ws.controller';

@Module({
  imports: [DocumentDomainModule, InfrastructureModule],
  providers: [
    MeetDomainInteractor,
    {
      provide: 'INIT_WS_CONTROLLER',
      useFactory: (meetInteractor: MeetDomainInteractor) => {
        // Устанавливаем интерактор для использования в WS контроллере
        setMeetInteractor(meetInteractor);
        return true;
      },
      inject: [MeetDomainInteractor],
    },
  ],
  exports: [MeetDomainInteractor],
})
export class ControllerWsMeetModule {}
