import { defineStore } from 'pinia';
import { ref, Ref } from 'vue';
import { api } from '../api';
import type {
  IVote,
  IVotesPagination,
  IGetVoteInput,
  IGetVotesInput,
} from './types';

const namespace = 'voteStore';

interface IVoteStore {
  votes: Ref<IVotesPagination | null>;
  loadVotes: (data: IGetVotesInput) => Promise<void>;
  vote: Ref<IVote | null>;
  loadVote: (data: IGetVoteInput) => Promise<void>;
}

export const useVoteStore = defineStore(namespace, (): IVoteStore => {
  const votes = ref<IVotesPagination | null>(null);
  const vote = ref<IVote | null>(null);

  const loadVotes = async (data: IGetVotesInput): Promise<void> => {
    const loadedData = await api.loadVotes(data);
    votes.value = loadedData;
  };

  const loadVote = async (data: IGetVoteInput): Promise<void> => {
    const loadedData = await api.loadVote(data);
    vote.value = loadedData;
  };

  return {
    votes,
    vote,
    loadVotes,
    loadVote,
  };
});
