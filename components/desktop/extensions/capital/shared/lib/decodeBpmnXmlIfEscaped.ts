function decodeHtmlEntitiesOnce(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

/** Восстанавливает XML после ошибочного HTML-экранирования в теле запроса / старых данных в БД. */
export function decodeBpmnXmlIfEscaped(xml: string): string {
  if (!xml.includes('&lt;') && !xml.includes('&amp;lt;')) {
    return xml;
  }
  let out = xml;
  for (let i = 0; i < 4; i += 1) {
    const next = decodeHtmlEntitiesOnce(out);
    if (next === out) {
      break;
    }
    out = next;
  }
  return out;
}
