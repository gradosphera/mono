import { IAction } from '~/types/common';
import { MeetDecisionDomainInterface } from './meet-decision-domain.interface';

export interface ProcessMeetDecisionInputDomainInterface {
  action: IAction;
  decisionData: MeetDecisionDomainInterface;
}
