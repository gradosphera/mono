export interface AgendaPointPreset {
  title: string;
  decision: string;
  context?: string;
}

export interface CreateMeetPreset {
  coopname?: string;
  initiator?: string;
  presider?: string;
  secretary?: string;
  open_at?: string;
  close_at?: string;
  username?: string;
  type?: 'regular' | 'extra';
  agenda_points?: AgendaPointPreset[];
}
