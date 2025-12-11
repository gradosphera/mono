const UNDERSCORE = '____________';

type ReplacementResolver = (path: string) => string;

const stripApprovedHeader = (html: string): string =>
  html.replace(/<div[^>]*style="text-align:\s*right[^>]*">[\s\S]*?<\/div>\s*/i, '');

const stripBranchedBlocks = (html: string): string =>
  html.replace(/{%\s*if\s*coop\.is_branched\s*%}[\s\S]*?{%\s*endif\s*%}/gi, '');

const replaceTransTags = (
  html: string,
  translations: Record<string, string>,
  resolve: ReplacementResolver,
): string =>
  html.replace(
    /{%\s*trans\s*'([^']+)'\s*(?:,\s*([^%]+?))?\s*%}/g,
    (_match, key: string, argsStr?: string) => {
      const base = translations[key] ?? '';
      if (!argsStr) return base;
      const args = argsStr.split(',').map((s: string) => s.trim()).filter(Boolean);
      return args.reduce(
        (acc, arg, idx) => acc.replace(new RegExp(`\\{${idx}\\}`, 'g'), resolve(arg)),
        base,
      );
    },
  );

const replacePlaceholders = (html: string, resolve: ReplacementResolver): string =>
  html.replace(/\{\{\s*([^}]+)\s*\}\}/g, (_m, path: string) => resolve(path.trim()));

const handlePassportRequest = (html: string, passportRequest: 'yes' | 'no'): string => {
  const regex =
    /{%\s*if\s*vars\.passport_request\s*==\s*'yes'\s*%}([\s\S]*?){%\s*endif\s*%}/g;
  return html.replace(regex, (_m, inner: string) => (passportRequest === 'yes' ? inner : ''));
};

export const renderTemplate = ({
  context,
  translations,
  resolve,
  stripHeader = true,
  passportRequest = 'no',
}: {
  context: string;
  translations: Record<string, string>;
  resolve: ReplacementResolver;
  stripHeader?: boolean;
  passportRequest?: 'yes' | 'no';
}) => {
  let html = context;
  if (stripHeader) {
    html = stripApprovedHeader(html);
  }
  html = stripBranchedBlocks(html);
  html = replaceTransTags(html, translations, resolve);
  html = handlePassportRequest(html, passportRequest);
  html = replacePlaceholders(html, resolve);
  return html;
};

type ParticipantType = 'individual' | 'entrepreneur' | 'organization';

const extractParticipantBlock = (context: string, type: ParticipantType): string => {
  const prefixMatch = context.match(/([\s\S]*?){%\s*if\s*type\s*==\s*'individual'\s*%}/);
  const individualMatch = context.match(
    /{%\s*if\s*type\s*==\s*'individual'\s*%}([\s\S]*?){%\s*elif\s*type\s*==\s*'entrepreneur'\s*%}/,
  );
  const entrepreneurMatch = context.match(
    /{%\s*elif\s*type\s*==\s*'entrepreneur'\s*%}([\s\S]*?){%\s*elif\s*type\s*==\s*'organization'\s*%}/,
  );
  const organizationMatch = context.match(
    /{%\s*elif\s*type\s*==\s*'organization'\s*%}([\s\S]*?){%\s*endif\s*%}/,
  );
  const suffix = context.split(/{%\s*endif\s*%}/)[1] ?? '';

  const prefix = prefixMatch?.[1] ?? '';
  const blocks: Record<ParticipantType, string | undefined> = {
    individual: individualMatch?.[1],
    entrepreneur: entrepreneurMatch?.[1],
    organization: organizationMatch?.[1],
  };

  const block = blocks[type] ?? blocks.individual ?? '';
  return `${prefix}${block}${suffix}`;
};

export const renderParticipantApplication = ({
  context,
  translations,
  type,
  resolve,
  passportRequest,
}: {
  context: string;
  translations: Record<string, string>;
  type: ParticipantType;
  resolve: ReplacementResolver;
  passportRequest: 'yes' | 'no';
}) => {
  const scoped = extractParticipantBlock(context, type);
  const rendered = renderTemplate({
    context: scoped,
    translations,
    resolve,
    passportRequest,
  });
  return rendered.replace(/<img[^>]*>/gi, UNDERSCORE);
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const buildVoskhodMembershipDecision = (_resolve: ReplacementResolver): string =>
  [
    'Одобрить вступление в пайщики Потребительского Кооператива «Восход» с оплатой вступительного и минимального паевого взносов (1000 и 3000 руб. соответственно).',
    'Поручить председателю совета осуществить соответствующие мероприятия.',
  ].join('\n');
