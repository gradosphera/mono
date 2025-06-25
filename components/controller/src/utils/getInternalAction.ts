function getInternalAction(data, actionName) {
  // Вспомогательная функция для рекурсивного поиска
  function searchTraces(traces) {
    for (const trace of traces) {
      if (trace.act.name === actionName) {
        return trace.act.data; // Предполагается, что вам нужны данные, а не сам act
      }
      if (trace.inline_traces && trace.inline_traces.length) {
        const result = searchTraces(trace.inline_traces);
        if (result) {
          return result;
        }
      }
    }
    return null;
  }

  // Начальный вызов для processed.action_traces
  if (data?.processed?.action_traces) {
    return searchTraces(data.processed.action_traces);
  }

  return null;
}

export default getInternalAction;
