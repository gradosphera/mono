import { registerEnumType } from '@nestjs/graphql';

/**
 * Формат тела требования (story): Markdown, BPMN 2.0 XML, draw.io XML, Mermaid в поле description.
 */
export enum StoryContentFormat {
  MARKDOWN = 'MARKDOWN',
  BPMN = 'BPMN',
  DRAWIO = 'DRAWIO',
  MERMAID = 'MERMAID',
}

registerEnumType(StoryContentFormat, {
  name: 'CapitalStoryContentFormat',
  description:
    'Формат содержимого требования (истории) в CAPITAL: MARKDOWN, BPMN (XML), DRAWIO (draw.io / diagrams.net XML) или MERMAID (текст диаграммы)',
});
