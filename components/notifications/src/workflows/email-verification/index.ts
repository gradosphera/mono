import { WorkflowDefinition, type BaseWorkflowPayload } from '../../types';
import { WorkflowBuilder } from '../../base/workflow-builder';
import { createEmailStep } from '../../base/defaults';
import { z } from 'zod';
import { slugify } from '../../utils';

// Схема для email-verification воркфлоу
export const emailVerificationPayloadSchema = z.object({
  verificationUrl: z.string(),
});

export type IPayload = z.infer<typeof emailVerificationPayloadSchema>;

export interface IWorkflow extends BaseWorkflowPayload, IPayload {}

export const name = 'Верификация Email';
export const id = slugify(name);

export const workflow: WorkflowDefinition<IWorkflow> = WorkflowBuilder
  .create<IWorkflow>()
  .name(name)
  .workflowId(id)
  .description('Верификация email адреса пользователя')
  .payloadSchema(emailVerificationPayloadSchema)
  .tags(['auth'])
  .addSteps([
    createEmailStep(
      'email-verification-email',
      'Email Verification',
      'Dear user,<br><br>' +
      'To verify your email, click on this link: <a href="{{payload.verificationUrl}}">{{payload.verificationUrl}}</a><br><br>' +
      'If you did not create an account, then ignore this email.'
    ),
  ])
  .build();
