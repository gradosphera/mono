/**
 * Универсальные типы для компонента онбординга с собраниями совета
 */

export type CouncilOnboardingStepStatus = 'pending' | 'in_progress' | 'completed';

export interface ICouncilOnboardingStep {
  id: string;
  title: string;
  description: string;
  status: CouncilOnboardingStepStatus;
  question: string;
  decision: string;
  decisionPrefix?: string;
  hash?: string | null;
  depends_on?: string[]; // ID шагов, которые должны быть завершены перед этим шагом
}

export interface ICouncilOnboardingConfig {
  steps: ICouncilOnboardingStep[];
  expireAt?: Date | null;
  completionMessage?: string;
  completionTitle?: string;
}

export interface ICouncilOnboardingActions {
  onStepClick: (step: ICouncilOnboardingStep) => void;
  onStepSubmit: (step: ICouncilOnboardingStep) => Promise<void>;
  checkCompletion?: () => boolean;
}
