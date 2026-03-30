import { StoryContentFormat } from '../enums/story-content-format.enum';

function decodeHtmlEntitiesOnce(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

const XML_STORY_FORMATS: ReadonlySet<StoryContentFormat> = new Set([
  StoryContentFormat.BPMN,
  StoryContentFormat.DRAWIO,
]);

/**
 * XML в БД мог сохраниться с HTML-сущностями (`&lt;`); восстанавливаем валидный XML для BPMN и DRAWIO.
 * Создание/обновление требований идёт через мутации из allowlist xss (см. graphql-xss-skip.ts).
 */
export function normalizeBpmnStoryDescription(
  description: string | undefined,
  contentFormat: StoryContentFormat,
): string | undefined {
  if (description === undefined || description === '') {
    return description;
  }
  if (!XML_STORY_FORMATS.has(contentFormat)) {
    return description;
  }
  if (!description.includes('&lt;') && !description.includes('&amp;lt;')) {
    return description;
  }
  let out = description;
  for (let i = 0; i < 4; i += 1) {
    const next = decodeHtmlEntitiesOnce(out);
    if (next === out) {
      break;
    }
    out = next;
  }
  return out;
}
