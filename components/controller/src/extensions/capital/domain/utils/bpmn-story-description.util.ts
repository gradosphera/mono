import { StoryContentFormat } from '../enums/story-content-format.enum';

function decodeHtmlEntitiesOnce(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

/**
 * Глобальный middleware xss-clean экранирует `<` в теле JSON (в т.ч. GraphQL variables).
 * BPMN XML в БД мог сохраниться как `&lt;?xml ...`; восстанавливаем валидный XML только для BPMN.
 */
export function normalizeBpmnStoryDescription(
  description: string | undefined,
  contentFormat: StoryContentFormat,
): string | undefined {
  if (description === undefined || description === '') {
    return description;
  }
  if (contentFormat !== StoryContentFormat.BPMN) {
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
