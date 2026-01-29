<template>
  <div class="diff-viewer">
    <div
      class="diff-content"
      v-html="formatDiff(diff)"
    />
  </div>
</template>

<script setup lang="ts">
interface Props {
  diff: string;
}

defineProps<Props>();

// Функция форматирования diff с подсветкой синтаксиса
const formatDiff = (diff: string) => {
  if (!diff) return '';

  const escapeHtml = (str: string) => {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  };

  const lines = diff.split('\n');
  const formattedLines = lines.map(line => {
    const escapedLine = escapeHtml(line);

    // Заголовки файлов (diff --git)
    if (line.startsWith('diff --git')) {
      return `<p style="color: #9c88ff; background-color: rgba(156, 136, 255, 0.1); font-weight: bold; margin: 0; border-radius: 4px;">${escapedLine}</p>`;
    }
    // Индексы и режимы файлов
    if (line.startsWith('index ') || line.startsWith('new file') || line.startsWith('deleted file') || line.startsWith('---') || line.startsWith('+++')) {
      return `<p style="color: #9c88ff; background-color: rgba(156, 136, 255, 0.05); margin: 0;">${escapedLine}</p>`;
    }
    // Заголовки блоков изменений (@@)
    if (line.startsWith('@@')) {
      return `<p style="color: #64b5f6; font-weight: bold; margin: 0;">${escapedLine}</p>`;
    }
    // Добавленные строки (+)
    if (line.startsWith('+')) {
      return `<p style="color: #4caf50; background-color: rgba(76, 175, 80, 0.1); margin: 0;">${escapedLine}</p>`;
    }
    // Удалённые строки (-)
    if (line.startsWith('-')) {
      return `<p style="color: #f44336; background-color: rgba(244, 67, 54, 0.1); margin: 0;">${escapedLine}</p>`;
    }
    // Обычные строки
    return `<p style="margin: 0;">${escapedLine}</p>`;
  });

  return formattedLines.join('');
};
</script>

<style scoped>
.diff-viewer {
  width: 100%;
}

.diff-content {
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;

  padding: 0;
  overflow-x: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-wrap: break-word;
  margin: 0;
  line-height: 1.4;

  p {
    padding: 2px 12px;
    margin: 0;
    &:empty::before {
      content: '\00a0';
    }
  }
}
</style>
