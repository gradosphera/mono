/**
 * Утилиты для работы с Markdown
 */

/**
 * Конвертирует обычный текст в формат Markdown
 * @param text - обычный текст
 * @returns markdown строка
 */
export const textToMarkdown = (text: string): string => {
  if (!text || text.trim() === '') {
    return '';
  }

  // Текст уже является Markdown, просто возвращаем его
  return text;
};

/**
 * Конвертирует Markdown обратно в обычный текст
 * @param markdown - markdown строка
 * @returns обычный текст без форматирования
 */
export const markdownToText = (markdown: string): string => {
  if (!markdown || markdown.trim() === '') {
    return '';
  }

  try {
    // Удаляем markdown форматирование
    return markdown
      .replace(/^#{1,6}\s+/gm, '') // Заголовки
      .replace(/\*\*(.+?)\*\*/g, '$1') // Жирный текст
      .replace(/\*(.+?)\*/g, '$1') // Курсив
      .replace(/\[(.+?)\]\(.+?\)/g, '$1') // Ссылки
      .replace(/`(.+?)`/g, '$1') // Инлайн код
      .replace(/^[-*+]\s+/gm, '') // Списки
      .replace(/^\d+\.\s+/gm, '') // Нумерованные списки
      .replace(/^>\s+/gm, '') // Цитаты
      .replace(/```[\s\S]*?```/g, '') // Блоки кода
      .trim();
  } catch (error) {
    console.warn('Failed to parse Markdown:', error);
    return markdown;
  }
};

/**
 * Конвертирует EditorJS формат в Markdown
 * Для миграции со старого формата
 * @param editorJSData - данные в формате EditorJS (строка или объект)
 * @returns markdown строка
 */
export const editorJSToMarkdown = (editorJSData: string | any): string => {
  try {
    const data = typeof editorJSData === 'string' ? JSON.parse(editorJSData) : editorJSData;

    if (!data || !data.blocks || !Array.isArray(data.blocks)) {
      return '';
    }

    return data.blocks
      .map((block: any) => {
        switch (block.type) {
          case 'header':
            const level = block.data?.level || 2;
            return '#'.repeat(level) + ' ' + (block.data?.text || '');
          
          case 'paragraph':
            return block.data?.text || '';
          
          case 'list':
            const listTag = block.data?.style === 'ordered' ? '1.' : '-';
            return block.data?.items?.map((item: string) => `${listTag} ${item}`).join('\n') || '';
          
          case 'quote':
            const quote = '> ' + (block.data?.text || '');
            const caption = block.data?.caption ? '\n> \n> — ' + block.data.caption : '';
            return quote + caption;
          
          case 'code':
            return '```\n' + (block.data?.code || '') + '\n```';
          
          default:
            return block.data?.text || '';
        }
      })
      .join('\n\n');
  } catch (error) {
    console.warn('Failed to convert EditorJS to Markdown:', error);
    return '';
  }
};

/**
 * Проверяет, является ли строка EditorJS форматом
 * @param data - данные для проверки
 * @returns true если это EditorJS формат
 */
export const isEditorJSFormat = (data: string | any): boolean => {
  try {
    const parsed = typeof data === 'string' ? JSON.parse(data) : data;
    return parsed && parsed.blocks && Array.isArray(parsed.blocks);
  } catch {
    return false;
  }
};

/**
 * Конвертирует данные в Markdown, определяя формат автоматически
 * @param data - данные в любом формате
 * @returns markdown строка
 */
export const toMarkdown = (data: string | any): string => {
  if (!data) return '';
  
  if (typeof data === 'string') {
    // Проверяем, является ли это EditorJS JSON
    if (isEditorJSFormat(data)) {
      return editorJSToMarkdown(data);
    }
    // Иначе считаем что это уже Markdown или обычный текст
    return data;
  }
  
  // Если объект, пробуем конвертировать из EditorJS
  if (isEditorJSFormat(data)) {
    return editorJSToMarkdown(data);
  }
  
  return String(data);
};
