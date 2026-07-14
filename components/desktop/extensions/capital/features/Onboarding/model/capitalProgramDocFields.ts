export type EditableFieldKey =
  | 'generator_program_purpose'
  | 'eoap_definition'
  | 'generator_task_goal'
  | 'idea_unit_cost'
  | 'idea_unit_cost_words'
  | 'blagorost_goal_expansion'
  | 'blagorost_task_expansion'
  | 'blagorost_task_development'
  | 'return_source_description'
  | 'return_additional_source';

export const PREVIEW_PLACEHOLDER = '______';

export const FIELD_LABELS: Record<EditableFieldKey, string> = {
  generator_program_purpose: 'Направление самореализации после слов «по …»',
  eoap_definition: 'Определение ЕОАП после слов «а именно:»',
  generator_task_goal: 'Характеристика ЕОАП после слов «развитие ЕОАП как …»',
  idea_unit_cost: 'Стоимость единицы идеи (цифрами)',
  idea_unit_cost_words: 'Стоимость единицы идеи (прописью)',
  blagorost_goal_expansion: 'Потребность участников в развитии ЕОАП',
  blagorost_task_expansion: 'Задача расширения участников ЕОАП',
  blagorost_task_development: 'Задача развития ЕОАП',
  return_source_description: 'Описание экономического эффекта ЕОАП',
  return_additional_source: 'Дополнительный источник возврата паевых взносов',
};

export const GENERATOR_DOC_FIELDS: EditableFieldKey[] = [
  'generator_program_purpose',
  'eoap_definition',
  'generator_task_goal',
  'idea_unit_cost',
  'idea_unit_cost_words',
];

export const BLAGOROST_DOC_FIELDS: EditableFieldKey[] = [
  'blagorost_goal_expansion',
  'blagorost_task_expansion',
  'blagorost_task_development',
  'return_source_description',
  'return_additional_source',
  'eoap_definition',
];

export const ALL_DOC_FIELDS: EditableFieldKey[] = [
  ...GENERATOR_DOC_FIELDS,
  ...BLAGOROST_DOC_FIELDS.filter((key) => !GENERATOR_DOC_FIELDS.includes(key)),
];

export const DOCUMENT_SECTIONS = [
  {
    registryId: 994,
    tabLabel: 'Положение ГЕНЕРАТОР',
    hint: 'Параметры подставляются в положение о программе «ГЕНЕРАТОР». Пустые поля отображаются прочерками — заполните их прямо в тексте документа.',
  },
  {
    registryId: 998,
    tabLabel: 'Положение БЛАГОРОСТ',
    hint: 'Параметры подставляются в положение о программе «БЛАГОРОСТ», включая источники возврата. Заполните поля inline в тексте документа.',
  },
] as const;
