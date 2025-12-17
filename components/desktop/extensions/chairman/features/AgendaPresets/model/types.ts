export interface IDocumentPreset {
  id: string
  registry_id: number
  title: string
  description: string
  question: string
  decisionPrefix: string
  getData: () => Record<string, any>
}
