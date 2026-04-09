/**
 * Допуск к проекту Capital (подтверждённый appendix / makeClearance).
 * Реализация — расширение capital; токен INTER_PROJECT_CAPITAL_CLEARANCE в InterCommunicationBridgeModule.
 */
export interface InterProjectCapitalClearancePort {
  listUsernamesWithConfirmedProjectClearance(projectHash: string): Promise<string[]>;
}
