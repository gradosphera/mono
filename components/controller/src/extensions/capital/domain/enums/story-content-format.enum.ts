import { registerEnumType } from '@nestjs/graphql';

/**
 * Формат тела требования (story): markdown-текст или BPMN 2.0 XML в поле description.
 */
export enum StoryContentFormat {
  MARKDOWN = 'MARKDOWN',
  BPMN = 'BPMN',
}

registerEnumType(StoryContentFormat, {
  name: 'CapitalStoryContentFormat',
  description: 'Формат содержимого требования (истории) в CAPITAL',
});
