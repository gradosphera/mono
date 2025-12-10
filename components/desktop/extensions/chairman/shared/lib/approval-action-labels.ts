const approval_action_labels: Record<string, string> = {
  'capital::apprvappndx': 'Допуск к проекту по приложению Благороста',
  'capital::approvereg': 'Договор УХД по приложению Благороста',
  'capital::approveinvst': 'Заявление на инвестицию в проект по приложению Благороста',
  'capital::approverslt': 'Внесение результата по приложению Благороста',
};

export const get_approval_action_label = (
  callback_contract: string,
  callback_action_approve: string,
): string => {
  const key = `${callback_contract}::${callback_action_approve}`;
  return approval_action_labels[key] ?? key;
};
