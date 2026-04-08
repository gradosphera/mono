function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Меняем ключ — пересоздаём initialize после смены настроек Mermaid (иначе старый кэш без htmlLabels:false). */
const MERMAID_EDITOR_INIT_VERSION = 2;

let lastMermaidInitKey: string | null = null;

/**
 * Превью для fenced-блока с языком `mermaid` в Crepe (CodeMirror code block).
 * См. https://github.com/orgs/Milkdown/discussions/1479 — через renderPreview + applyPreview.
 * `undefined` при первом вызове → панель показывает previewLoading, затем applyPreview(svg).
 */
export function crepeMermaidRenderPreview(dark: boolean) {
  return (
    language: string,
    content: string,
    applyPreview: (value: string | HTMLElement | null) => void,
  ): string | HTMLElement | null | undefined => {
    const lang = language.trim().toLowerCase();
    if (lang !== 'mermaid' || !content.trim()) {
      return null;
    }

    void (async () => {
      try {
        const mermaid = (await import('mermaid')).default;
        /*
         * Превью Crepe прогоняет строку через DOMPurify — foreignObject+HTML из подписей вырезается,
         * в разметке остаются пустые label/rect. htmlLabels: false → нативный SVG <text>, проходит sanitize.
         * securityLevel: antiscript — без скриптов в разметке, но не ломает обычный текст (в т.ч. кириллицу).
         */
        const initKey = `${MERMAID_EDITOR_INIT_VERSION}:${dark ? '1' : '0'}`;
        if (lastMermaidInitKey !== initKey) {
          mermaid.initialize({
            startOnLoad: false,
            theme: dark ? 'dark' : 'neutral',
            securityLevel: 'antiscript',
            htmlLabels: false,
          });
          lastMermaidInitKey = initKey;
        }

        const id = `mmd-${crypto.randomUUID().replace(/-/g, '')}`;
        const { svg } = await mermaid.render(id, content);
        applyPreview(svg);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        applyPreview(
          `<p class="editor-mermaid-preview-error">${escapeHtml(msg)}</p>`,
        );
      }
    })();

    return undefined;
  };
}
