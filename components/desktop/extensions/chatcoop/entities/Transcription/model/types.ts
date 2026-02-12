import type { Queries } from '@coopenomics/sdk';

// Типы вывода из queries
export type ITranscription = Queries.ChatCoop.GetTranscriptions.IOutput[typeof Queries.ChatCoop.GetTranscriptions.name][number];

export type ITranscriptionSegment = NonNullable<Queries.ChatCoop.GetTranscription.IOutput[typeof Queries.ChatCoop.GetTranscription.name]>['segments'][number];

export type ITranscriptionWithSegments = Queries.ChatCoop.GetTranscription.IOutput[typeof Queries.ChatCoop.GetTranscription.name];

export type IGetTranscriptionsOutput = Queries.ChatCoop.GetTranscriptions.IOutput[typeof Queries.ChatCoop.GetTranscriptions.name];

export type IGetTranscriptionOutput = Queries.ChatCoop.GetTranscription.IOutput[typeof Queries.ChatCoop.GetTranscription.name];
