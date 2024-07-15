export interface ITemplateStrategy {
  fillMessage: (data: any) => string
  fillSubject: (data: any) => string
  process: boolean
}
