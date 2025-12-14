import { Mutations } from '@coopenomics/sdk';
import { Cooperative } from 'cooptypes';
import type { AgendaPointPreset, CreateMeetPreset } from 'src/features/Meet/CreateMeet/ui/types';
import { renderTemplate } from './onboarding-templates';

const UNDERSCORE = '____________';

const VOSKHOD_MEMBERSHIP_DECISION =
  'Одобрить вступление в пайщики Потребительского Кооператива "Восход" с оплатой вступительного и минимального паевого взносов ( 1000.00 RUB и 3000.00 RUB соответственно). Представлять Общество в выборных органах управления и на общих собраниях пайщиков Потребительского Кооператива "ВОСХОД" поручено Председателю Совета Общества';

export type AgendaStepKey =
  | Mutations.Chairman.CompleteOnboardingAgendaStep.IInput['data']['step'];

export type AgendaStepPreset = {
  title: string;
  description: string;
  question: string;
  decision: string;
};

type CoopContacts = {
  full_name?: string;
  short_name?: string;
  city?: string;
  chairman?: string | { first_name?: string; last_name?: string; middle_name?: string };
};

type CooperatorAccount = {
  initial?: string;
  minimum?: string;
  org_initial?: string;
  org_minimum?: string;
};

type SystemInfoLite = {
  vars?: Cooperative.Model.IVars | null;
  contacts?: CoopContacts | null;
  cooperator_account?: CooperatorAccount | null;
};

const formatMoney = (value?: string): string => {
  if (!value) return '';
  const parts = value.trim().split(/\s+/);
  const numPart = parts[0] ?? '';
  const currency = parts.slice(1).join(' ');
  const num = Number.parseFloat(numPart.replace(/[^\d.-]+/g, ''));
  const formatted = Number.isNaN(num) ? numPart : num.toFixed(2);
  return [formatted, currency].filter(Boolean).join(' ');
};

const createResolver = (info: SystemInfoLite): ((path: string) => string) => {
  const vars = info.vars;
  const contacts = info.contacts || {};
  const account = info.cooperator_account || {};

  const coopDisplayShort = `${vars?.full_abbr || vars?.short_abbr || ''}${
    vars?.name ? ` "${vars?.name}"` : ''
  }`.trim();
  const coopFull = contacts.full_name || coopDisplayShort || UNDERSCORE;
  const coopShort = contacts.short_name || coopDisplayShort || UNDERSCORE;
  const coopCity = contacts.city || '';
  const chairmanName =
    typeof contacts.chairman === 'string'
      ? contacts.chairman
      : contacts.chairman
      ? [contacts.chairman.last_name, contacts.chairman.first_name, contacts.chairman.middle_name]
          .filter(Boolean)
          .join(' ')
      : '';

  const map: Record<string, string> = {
    'vars.full_abbr': vars?.full_abbr || '',
    'vars.full_abbr_genitive': vars?.full_abbr_genitive || '',
    'vars.full_abbr_dative': vars?.full_abbr_dative || '',
    'vars.short_abbr': vars?.short_abbr || '',
    'vars.name': vars?.name || '',
    'vars.website': vars?.website || '',
    'vars.confidential_email': vars?.confidential_email || '',
    'vars.confidential_link': vars?.confidential_link || '',
    'coop.chairman.last_name': contacts.chairman && typeof contacts.chairman === 'object' ? contacts.chairman.last_name || '' : (typeof contacts.chairman === 'string' ? contacts.chairman.split(' ')[0] || '' : ''),
    'coop.chairman.first_name': contacts.chairman && typeof contacts.chairman === 'object' ? contacts.chairman.first_name || '' : (typeof contacts.chairman === 'string' ? contacts.chairman.split(' ')[1] || '' : ''),
    'coop.chairman.middle_name': contacts.chairman && typeof contacts.chairman === 'object' ? contacts.chairman.middle_name || '' : (typeof contacts.chairman === 'string' ? contacts.chairman.split(' ')[2] || '' : ''),
    'coop.short_name': coopShort,
    'coop.full_name': coopFull,
    'coop.city': coopCity,
    'vars.wallet_agreement.protocol_number': vars?.wallet_agreement?.protocol_number || '',
    'vars.wallet_agreement.protocol_day_month_year': vars?.wallet_agreement?.protocol_day_month_year || '',
    'vars.signature_agreement.protocol_number': vars?.signature_agreement?.protocol_number || '',
    'vars.signature_agreement.protocol_day_month_year': vars?.signature_agreement?.protocol_day_month_year || '',
    'vars.privacy_agreement.protocol_number': vars?.privacy_agreement?.protocol_number || '',
    'vars.privacy_agreement.protocol_day_month_year': vars?.privacy_agreement?.protocol_day_month_year || '',
    'vars.user_agreement.protocol_number': vars?.user_agreement?.protocol_number || '',
    'vars.user_agreement.protocol_day_month_year': vars?.user_agreement?.protocol_day_month_year || '',
    'vars.participant_application.protocol_number': vars?.participant_application?.protocol_number || '',
    'vars.participant_application.protocol_day_month_year': vars?.participant_application?.protocol_day_month_year || '',
    initial: formatMoney(account.initial),
    minimum: formatMoney(account.minimum),
    org_initial: formatMoney(account.org_initial),
    org_minimum: formatMoney(account.org_minimum),
    chairman: chairmanName,
  };

  return (path: string) => map[path] ?? UNDERSCORE;
};

const buildDecisionFromTemplate = (
  registry: keyof typeof Cooperative.Registry,
  info: SystemInfoLite,
): string => {
  const template = Cooperative.Registry[registry] as { context: string; translations: { ru: any } };
  const resolve = createResolver(info);
  const passportRequest = info.vars?.passport_request === 'yes' ? 'yes' : 'no';
  return renderTemplate({
    context: template.context,
    translations: template.translations.ru,
    resolve,
    stripAcceptanceAgreement: registry === 'WalletAgreement' || registry === 'RegulationElectronicSignature' || registry === 'PrivacyPolicy' || registry === 'UserAgreement',
    fixPrivacyPolicy: registry === 'PrivacyPolicy',
    passportRequest,
  });
};

const buildParticipantFormsDecision = (info: SystemInfoLite): string => {
  const resolve = createResolver(info);
  const passportNeeded = info.vars?.passport_request === 'yes';
  const coopShort = resolve('coop.short_name');
  const initial = resolve('initial');
  const minimum = resolve('minimum');
  const orgInitial = resolve('org_initial');
  const orgMinimum = resolve('org_minimum');

  const passportBlock = passportNeeded
    ? 'Паспорт № ____________ ____________, код подразделения ____________, выдан ____________ от ____________.'
    : '';

  const individual = [
    '<h1 style="text-align:center;">Заявление физического лица о приеме в пайщики</h1>',
    `<p style="text-align:center;">в ${coopShort}</p>`,
    '<p>____________,</p>',
    `<p>В Совет ${coopShort} от ____________ ____________ ____________, дата рождения ____________, адрес регистрации (как в паспорте):  ____________, номер телефона с активированной функцией получения sms: ____________, адрес электронной почты: ____________. ${passportBlock}</p>`,
    `<p>Прошу принять меня в пайщики ${coopShort}. Подтверждаю, что с Уставом и иными нормативными документами Общества ознакомлен(а).</p>`,
    `<p>Обязуюсь своевременно внести в Общество вступительный ${initial} и минимальный паевой ${minimum} взносы в порядке, предусмотренном Уставом Общества.</p>`,
    '<p>Выражаю свое согласие с тем, что информация, отправляемая Обществом в sms-сообщениях на указанный мной номер телефона, в сообщениях на указанный мной адрес электронной почты, или в PUSH уведомлениях с сайта, приравнивается к уведомлению меня Обществом в письменной форме.</p>',
    '<p>____________</p><p>подпись</p><p>____________ ____________ ____________</p>',
  ].join('\n');

  const entrepreneur = [
    '<h1 style="text-align:center;">Заявление индивидуального предпринимателя о приеме в пайщики</h1>',
    `<p style="text-align:center;">в ${coopShort}</p>`,
    '<p>____________,</p>',
    `<p>В Совет ${coopShort} от индивидуального предпринимателя ____________ ____________ ____________, дата рождения ____________, адрес регистрации (как в паспорте):  ____________, ИНН ____________, ОГРНИП ____________, Р/с ____________, КПП ____________, К/с ____________, БИК ____________, банк получателя ____________, номер телефона с активированной функцией получения sms: ____________, адрес электронной почты: ____________.</p>`,
    `<p>Прошу принять меня в пайщики ${coopShort}. Подтверждаю, что с Уставом и иными нормативными документами Общества ознакомлен(а).</p>`,
    `<p>Обязуюсь своевременно внести в Общество вступительный ${initial} и минимальный паевой ${minimum} взносы в порядке, предусмотренном Уставом Общества.</p>`,
    '<p>Выражаю свое согласие с тем, что информация, отправляемая Обществом в sms-сообщениях на указанный мной номер телефона, в сообщениях на указанный мной адрес электронной почты, или в PUSH уведомлениях с сайта, приравнивается к уведомлению меня Обществом в письменной форме.</p>',
    '<p>____________</p><p>подпись</p><p>____________ ____________ ____________</p>',
  ].join('\n');

  const organization = [
    '<h1 style="text-align:center;">Заявление юридического лица о приеме в пайщики</h1>',
    `<p style="text-align:center;">в ${coopShort}</p>`,
    '<p>____________,</p>',
    `<p>В Совет «${coopShort}» от юридического лица ____________, юридический адрес: ____________, фактический адрес: ____________, ИНН ____________, ОГРН ____________, Р/с ____________, КПП ____________, К/с ____________, БИК ____________, банк получателя ____________, номер телефона с активированной функцией получения sms: ____________, адрес электронной почты: ____________.</p>`,
    `<p>Заявитель, в лице представителя юридического лица - ____________ ____________ ____________ ____________, действующий на основании ____________, просит принять в пайщики  ${coopShort}.</p>`,
    '<p>Подтверждает, что с Уставом и иными нормативными документами Общества ознакомлен.</p>',
    `<p>Обязуется своевременно внести в Общество вступительный ${orgInitial} и минимальный паевой ${orgMinimum} взносы в порядке, предусмотренном Уставом Общества.</p>`,
    '<p>Выражает свое согласие с тем, что информация, отправляемая Обществом в sms-сообщениях на указанный номер телефона, в сообщениях на указанный адрес электронной почты, или в PUSH уведомлениях с сайта, приравнивается к уведомлению Заявителя Обществом в письменной форме.</p>',
    '<p>____________</p><p>подпись</p><p>____________ ____________ ____________</p>',
  ].join('\n');

  return [
    '<div>Решили утвердить формы заявлений на вступление в кооператив:</div>',
    individual,
    '<hr/>',
    entrepreneur,
    '<hr/>',
    organization,
  ].join('\n');
};

export const buildAgendaStepPresets = (info: SystemInfoLite): Record<AgendaStepKey, AgendaStepPreset> => {
  const walletDecision = [
    'Утвердить положение о Целевой Потребительской Программе «Цифровой Кошелёк»:',
    '',
    buildDecisionFromTemplate('WalletAgreement', info),
  ].join('\n');

  const signatureDecision = [
    'Утвердить Положение о порядке иправилах использования простой электронной подписи:',
    '',
    buildDecisionFromTemplate('RegulationElectronicSignature', info),
  ].join('\n');

  const privacyDecision = [
    'Утвердить политику конфиденциальности:',
    '',
    buildDecisionFromTemplate('PrivacyPolicy', info),
  ].join('\n');

  const userDecision = [
    'Утвердить пользовательское соглашение:',
    '',
    buildDecisionFromTemplate('UserAgreement', info),
  ].join('\n');

  const participantDecision = buildParticipantFormsDecision(info);
  const voskhodDecision = VOSKHOD_MEMBERSHIP_DECISION;

  return {
    wallet_agreement: {
      title: 'Утверждение соглашения о ЦПП "Цифровой Кошелёк"',
      description: 'О утверждении соглашения о ЦПП "Цифровой Кошелёк".',
      question: 'О утверждении соглашения о ЦПП "Цифровой Кошелёк"',
      decision: walletDecision,
    },
    signature_agreement: {
      title: 'Утверждение положения о простой электронной подписи',
      description: 'О утверждении положения о простой электронной подписи.',
      question: 'О утверждении положения о простой электронной подписи',
      decision: signatureDecision,
    },
    privacy_agreement: {
      title: 'Утверждение политики конфиденциальности',
      description: 'О утверждении политики конфиденциальности.',
      question: 'О утверждении политики конфиденциальности',
      decision: privacyDecision,
    },
    user_agreement: {
      title: 'Утверждение пользовательского соглашения',
      description: 'О утверждении пользовательского соглашения.',
      question: 'О утверждении пользовательского соглашения',
      decision: userDecision,
    },
    participant_application: {
      title: 'Утверждение форм заявлений на вступление',
      description: 'О утверждении форм заявлений на вступление.',
      question: 'О утверждении форм заявлений на вступление',
      decision: participantDecision,
    },
    voskhod_membership: {
      title: 'О вступлении в ПК «Восход»',
      description: 'О вступлении в ПК «Восход»',
      question:
        'О вступлении в пайщики Потребительского Кооператива «Восход» с оплатой вступительного и минимального паевого взносов (1000.00 RUB и 3000.00 RUB соответственно)',
      decision: voskhodDecision,
    },
  };
};

export const generalMeetStepPreset = {
  title: 'Объявить общее собрание',
  description: 'Сформировать предложение повестки общего собрания пайщиков о вступлении в союз.',
};

const defaultGeneralMeetAgendaPoints: AgendaPointPreset[] = [
  {
    title:
      'О вступлении в члены Союза Потребительских Обществ «Русь» с оплатой вступительного взноса в размере 1500.00 RUB и годового членского взноса в размере 12000.00 RUB',
    decision:
      'Утвердить предложение о вступлении в члены Союза Потребительских Обществ «Русь» с оплатой вступительного взноса в размере 1500.00 RUB и годового членского взноса в размере 12000.00 RUB. Поручить председателю совета осуществить соответствующие мероприятия.',
    context: '',
  },
];

export const buildGeneralMeetPreset = (username: string): CreateMeetPreset => ({
  type: 'extra',
  presider: username,
  secretary: username,
  initiator: username,
  agenda_points: defaultGeneralMeetAgendaPoints.map((point) => ({ ...point })),
});
