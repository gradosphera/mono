// Черновики frontmatter для локального create (без API).

import type { ProjectRowLite } from '../sync/project-index-map.js'
import { issueWorkspaceTitlesFromProjects } from '../format/index.js'
import { storyStubBodyForFormat } from './story-stubs/index.js'

export interface DraftIssueFields {
  readonly title: string
  readonly pendingHashHex64: string
  readonly project_hash: string
  readonly projectRowByHash: Map<string, ProjectRowLite>
  readonly creators: string[]
  readonly submaster?: string
}

export function buildDraftIssueFrontmatterAndBody(f: DraftIssueFields): {
  data: Record<string, unknown>
  body: string
} {
  const workspace = issueWorkspaceTitlesFromProjects(f.project_hash, f.projectRowByHash)
  const now = new Date().toISOString()
  const data: Record<string, unknown> = {
    type: 'issue',
    id: '0',
    title: f.title,
    status: 'BACKLOG',
    priority: 'MEDIUM',
    estimate: 0,
    creators: f.creators,
    labels: [],
    hash: f.pendingHashHex64,
    project_hash: f.project_hash,
    created_at: now,
    updated_at: now,
  }
  if (workspace.project_title.trim() !== '') {
    data.project_title = workspace.project_title.trim()
  }
  if (workspace.component_title !== undefined && workspace.component_title.trim() !== '') {
    data.component_title = workspace.component_title.trim()
  }
  if (f.submaster !== undefined && f.submaster.trim() !== '') {
    data.submaster = f.submaster.trim()
  }
  return { data, body: '' }
}

export interface DraftStoryFields {
  readonly title: string
  readonly story_hash: string
  readonly project_hash: string
  readonly content_format: string
  readonly created_by?: string
  /** Явное тело; иначе подставляется рыба под content_format (см. create/story-stubs/). */
  readonly body?: string
}

export function buildDraftStoryFrontmatterAndBody(f: DraftStoryFields): {
  data: Record<string, unknown>
  body: string
} {
  const now = new Date().toISOString()
  const data: Record<string, unknown> = {
    type: 'story',
    title: f.title,
    hash: f.story_hash,
    content_format: f.content_format,
    status: 'PENDING',
    sort_order: 0,
    project_hash: f.project_hash,
    created_at: now,
    updated_at: now,
  }
  if (f.created_by !== undefined && f.created_by.trim() !== '') {
    data.created_by = f.created_by.trim()
  }
  const body = f.body ?? storyStubBodyForFormat(f.content_format)
  return { data, body }
}
