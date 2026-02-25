import { client } from 'src/shared/api/client'
import type { ProcessTemplate, ProcessInstance } from '../model/types'

const TEMPLATE_FIELDS = {
  id: true,
  coopname: true,
  project_hash: true,
  title: true,
  description: true,
  status: true,
  created_by: true,
  steps: { id: true, title: true, description: true, estimate: true, position: { x: true, y: true }, is_start: true },
  edges: { id: true, source: true, target: true },
  created_at: true,
  updated_at: true,
}

const INSTANCE_FIELDS = {
  id: true,
  coopname: true,
  template_id: true,
  project_hash: true,
  status: true,
  started_by: true,
  cycle: true,
  step_states: { step_id: true, status: true, issue_hash: true, completed_at: true },
  started_at: true,
  completed_at: true,
}

export async function getProcessTemplates(projectHash?: string): Promise<ProcessTemplate[]> {
  const args: any = {}
  if (projectHash) args.project_hash = projectHash
  const { capitalGetProcessTemplates } = await client.Query({
    capitalGetProcessTemplates: [args, TEMPLATE_FIELDS],
  })
  return capitalGetProcessTemplates as any
}

export async function getProcessTemplate(id: string): Promise<ProcessTemplate> {
  const { capitalGetProcessTemplate } = await client.Query({
    capitalGetProcessTemplate: [{ id }, TEMPLATE_FIELDS],
  })
  return capitalGetProcessTemplate as any
}

export async function createProcessTemplate(data: { project_hash: string; title: string; description?: string }): Promise<ProcessTemplate> {
  const { capitalCreateProcessTemplate } = await client.Mutation({
    capitalCreateProcessTemplate: [{ data }, TEMPLATE_FIELDS],
  })
  return capitalCreateProcessTemplate as any
}

export async function updateProcessTemplate(data: {
  id: string
  title?: string
  description?: string
  status?: string
  steps?: any[]
  edges?: any[]
}): Promise<ProcessTemplate> {
  const { capitalUpdateProcessTemplate } = await client.Mutation({
    capitalUpdateProcessTemplate: [{ data }, TEMPLATE_FIELDS],
  })
  return capitalUpdateProcessTemplate as any
}

export async function deleteProcessTemplate(id: string): Promise<boolean> {
  const { capitalDeleteProcessTemplate } = await client.Mutation({
    capitalDeleteProcessTemplate: [{ id }, true],
  })
  return capitalDeleteProcessTemplate as any
}

export async function startProcess(data: { template_id: string; project_hash: string }): Promise<ProcessInstance> {
  const { capitalStartProcess } = await client.Mutation({
    capitalStartProcess: [{ data }, INSTANCE_FIELDS],
  })
  return capitalStartProcess as any
}

export async function completeProcessStep(data: { instance_id: string; step_id: string }): Promise<ProcessInstance> {
  const { capitalCompleteProcessStep } = await client.Mutation({
    capitalCompleteProcessStep: [{ data }, INSTANCE_FIELDS],
  })
  return capitalCompleteProcessStep as any
}

export async function getProcessInstances(projectHash: string): Promise<ProcessInstance[]> {
  const { capitalGetProcessInstances } = await client.Query({
    capitalGetProcessInstances: [{ project_hash: projectHash }, INSTANCE_FIELDS],
  })
  return capitalGetProcessInstances as any
}
