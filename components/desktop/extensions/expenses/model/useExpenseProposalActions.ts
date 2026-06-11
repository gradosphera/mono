import { useSystemStore } from 'src/entities/System/model';
import { useSessionStore } from 'src/entities/Session';
import { DigitalDocument } from 'src/shared/lib/document';
import type { Cooperative } from 'cooptypes';
import { generateUniqueHash } from 'src/shared/lib/utils/generateUniqueHash';
import {
  generateExpenseProposalStatementDocument,
  generateExpenseProposalDecisionDocument,
  createExpenseProposal,
  authorizeExpenseReport,
} from '../api';

export interface ICreateProposalDraftItem {
  number: string;
  description: string;
  amount: string;
  recipient_type: 'SELF' | 'MEMBER' | 'ORG';
  mechanics: 'ADVANCE' | 'DIRECT';
  recipient_name?: string;
  requisites?: string;
  item_hash?: string;
  recipient_account?: string;
}

export interface ICreateProposalDraft {
  source_wallet: string;
  description: string;
  items: ICreateProposalDraftItem[];
}

export interface IAuthorizeProposalDraft {
  proposal_hash: string;
  description: string;
  source_wallet: string;
  items: ICreateProposalDraftItem[];
  decision_kind: 'approve' | 'decline';
  decision_reason?: string;
  protocol_number?: string;
  protocol_date?: string;
}

export function useExpenseProposalActions() {
  const { info } = useSystemStore();
  const session = useSessionStore();

  async function submitProposal(draft: ICreateProposalDraft) {
    const proposal_hash = await generateUniqueHash();

    const totalAmount = draft.items.reduce((sum, it) => sum + parseFloat(it.amount || '0'), 0);
    const total_amount = `${totalAmount.toFixed(4)} RUB`;

    const itemsForDoc = draft.items.map((it, idx) => ({
      number: String(idx + 1),
      description: it.description,
      amount: it.amount,
      recipient_type: it.recipient_type,
      mechanics: it.mechanics,
      recipient_name: it.recipient_name ?? '',
      requisites: it.requisites ?? '',
    }));

    const proposalHeader = {
      description: draft.description,
      total_amount,
      items_count: draft.items.length,
      source_wallet: draft.source_wallet,
    };

    const generated = await generateExpenseProposalStatementDocument({
      coopname: info.coopname,
      username: session.username,
      proposal_hash,
      proposal: proposalHeader,
      items: itemsForDoc,
    } as any);

    const docKey = 'generateExpenseProposalStatementDocument' as const;
    const generatedDoc = (generated as any)[docKey];

    const digital = new DigitalDocument(generatedDoc);
    const signed = await digital.sign<Cooperative.Registry.ExpenseProposalStatement.Meta>(
      session.username,
      1,
    );

    const itemsForChain = draft.items.map((it, idx) => ({
      item_hash: it.item_hash ?? generateItemHash(proposal_hash, idx),
      mechanics: it.mechanics,
      recipient_type: it.recipient_type,
      recipient: it.recipient_account ?? it.recipient_name ?? session.username,
      description: it.description,
      planned_amount: it.amount,
    }));

    return createExpenseProposal({
      coopname: info.coopname,
      username: session.username,
      proposal_hash,
      source_wallet: draft.source_wallet,
      items: itemsForChain,
      statement: signed as any,
    } as any);
  }

  async function authorizeProposal(draft: IAuthorizeProposalDraft) {
    const itemsForDoc = draft.items.map((it, idx) => ({
      number: String(idx + 1),
      description: it.description,
      amount: it.amount,
      recipient_type: it.recipient_type,
      mechanics: it.mechanics,
      recipient_name: it.recipient_name ?? '',
      requisites: it.requisites ?? '',
    }));

    const totalAmount = draft.items.reduce((sum, it) => sum + parseFloat(it.amount || '0'), 0);
    const total_amount = `${totalAmount.toFixed(4)} RUB`;

    const generated = await generateExpenseProposalDecisionDocument({
      coopname: info.coopname,
      username: session.username,
      proposal_hash: draft.proposal_hash,
      proposal: {
        description: draft.description,
        total_amount,
        items_count: draft.items.length,
        source_wallet: draft.source_wallet,
      },
      items: itemsForDoc,
      decision: {
        kind: draft.decision_kind,
        reason: draft.decision_reason,
        protocol_number: draft.protocol_number,
        protocol_date: draft.protocol_date,
      },
    } as any);

    const docKey = 'generateExpenseProposalDecisionDocument' as const;
    const generatedDoc = (generated as any)[docKey];

    const digital = new DigitalDocument(generatedDoc);
    const signed = await digital.sign<Cooperative.Registry.ExpenseProposalDecision.Meta>(
      session.username,
      1,
    );

    return authorizeExpenseReport({
      coopname: info.coopname,
      proposal_hash: draft.proposal_hash,
      decision: signed as any,
    } as any);
  }

  return { submitProposal, authorizeProposal };
}

function generateItemHash(proposal_hash: string, idx: number): string {
  return `${proposal_hash.slice(0, 56)}${idx.toString(16).padStart(8, '0')}`;
}
