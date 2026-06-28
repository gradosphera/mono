export interface CapitalProgramPrivateData {
  approval_protocol_number: string
  approval_protocol_day: string
  approval_protocol_month: string
  approval_protocol_year: string
  cooperative_name: string
  cooperative_short_name: string
  cooperative_quoted_name: string
  website: string
  chairman_full_name: string
  generator_program_purpose: string
  eoap_definition: string
  generator_task_goal: string
  idea_unit_cost: string
  idea_unit_cost_words: string
  blagorost_goal_expansion: string
  blagorost_task_expansion: string
  blagorost_task_development: string
  return_source_description: string
  return_additional_source: string
  offer_template_number: string
}

export const capitalProgramPrivateDataRequiredFields = [
  'approval_protocol_number',
  'approval_protocol_day',
  'approval_protocol_month',
  'approval_protocol_year',
  'cooperative_name',
  'cooperative_short_name',
  'cooperative_quoted_name',
  'website',
  'chairman_full_name',
  'generator_program_purpose',
  'eoap_definition',
  'generator_task_goal',
  'idea_unit_cost',
  'idea_unit_cost_words',
  'blagorost_goal_expansion',
  'blagorost_task_expansion',
  'blagorost_task_development',
  'return_source_description',
  'return_additional_source',
  'offer_template_number',
] as const

export function requireCapitalProgramPrivateData(
  payload: CapitalProgramPrivateData | null | undefined,
  registry_id: number,
): CapitalProgramPrivateData {
  if (!payload)
    throw new Error(`PrivateData для документа #${registry_id} не найдены: передайте doc_data_hash`)

  const missing = capitalProgramPrivateDataRequiredFields.filter((field) => {
    const value = payload[field]
    return typeof value !== 'string' || value.trim() === ''
  })

  if (missing.length) {
    throw new Error(`PrivateData для документа #${registry_id} заполнены не полностью: ${missing.join(', ')}`)
  }

  return payload
}
