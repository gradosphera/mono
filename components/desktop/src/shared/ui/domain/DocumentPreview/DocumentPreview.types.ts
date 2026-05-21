export type DocumentPreviewType = 'html' | 'pdf' | 'docx' | 'image' | 'txt';

export interface DocumentPreviewDoc {
  type: DocumentPreviewType;
  url?: string;
  html?: string;
  text?: string;
}

export interface DocumentPreviewProps {
  document: DocumentPreviewDoc;
  loading?: boolean;
  error?: string;
  height?: string | number;
  sanitize?: boolean;
}
