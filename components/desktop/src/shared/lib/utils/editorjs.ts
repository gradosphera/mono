/**
 * Утилиты для работы с EditorJS
 */

/**
 * Конвертирует обычный текст в формат EditorJS
 * @param text - обычный текст
 * @returns объект в формате EditorJS
 */
export const textToEditorJS = (text: string): string => {
  if (!text || text.trim() === '') {
    return '{}';
  }

  // Разбиваем текст на параграфы по двойным переносам строк
  const paragraphs = text.split('\n\n').filter(p => p.trim() !== '');

  const blocks = paragraphs.map(paragraph => ({
    type: 'paragraph',
    data: {
      text: paragraph.trim()
    }
  }));

  return JSON.stringify({
    time: Date.now(),
    blocks: blocks,
    version: '2.28.2'
  });
};

/**
 * Конвертирует EditorJS формат обратно в обычный текст
 * @param editorJSData - данные в формате EditorJS (строка или объект)
 * @returns обычный текст
 */
export const editorJSToText = (editorJSData: string | any): string => {
  try {
    const data = typeof editorJSData === 'string' ? JSON.parse(editorJSData) : editorJSData;

    if (!data || !data.blocks || !Array.isArray(data.blocks)) {
      return '';
    }

    return data.blocks
      .filter((block: any) => block.type === 'paragraph' && block.data?.text)
      .map((block: any) => block.data.text)
      .join('\n\n');
  } catch (error) {
    console.warn('Failed to parse EditorJS data:', error);
    return '';
  }
};
