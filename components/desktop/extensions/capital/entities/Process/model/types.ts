export interface ProcessStepPosition {
  x: number
  y: number
}

export interface ProcessStepTemplate {
  id: string
  title: string
  description?: string
  estimate?: number
  position: ProcessStepPosition
  is_start?: boolean
}

export interface ProcessEdge {
  id: string
  source: string
  target: string
}

export type ProcessTemplateStatus = 'draft' | 'active' | 'archived'
export type ProcessInstanceStatus = 'running' | 'completed' | 'cancelled'
export type ProcessStepStatus = 'pending' | 'active' | 'completed' | 'cancelled'

export interface ProcessTemplate {
  id: string
  coopname: string
  project_hash: string
  title: string
  description?: string
  status: ProcessTemplateStatus
  created_by: string
  steps: ProcessStepTemplate[]
  edges: ProcessEdge[]
  created_at: string
  updated_at: string
}

export interface ProcessStepState {
  step_id: string
  status: ProcessStepStatus
  issue_hash?: string
  completed_at?: string
}

export interface ProcessInstance {
  id: string
  coopname: string
  template_id: string
  project_hash: string
  status: ProcessInstanceStatus
  started_by: string
  cycle: number
  step_states: ProcessStepState[]
  started_at: string
  completed_at?: string
}
