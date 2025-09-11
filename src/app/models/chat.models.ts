export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface AIModel {
  id: string;
  name: string;
  description: string;
  version: string;
  capabilities: string[];
  status: 'online' | 'offline' | 'maintenance';
  performance: {
    speed: 'fast' | 'medium' | 'slow';
    accuracy: number; // 0-100
  };
  tokenLimit: number;
  supportsRAG: boolean;
  supportsCodeGeneration: boolean;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadDate: Date;
  status: 'uploading' | 'processing' | 'ready' | 'error';
  content?: string;
  metadata?: Record<string, any>;
}

export interface Citation {
  id: string;
  documentId: string;
  documentName: string;
  excerpt: string;
  pageNumber?: number;
  section?: string;
  confidence?: number;
  startIndex?: number;
  endIndex?: number;
}

export interface Message {
  id: string;
  conversationId: string;
  content: string;
  type: 'user' | 'ai';
  timestamp: Date;
  status: 'sending' | 'sent' | 'error';
  modelId?: string;
  citations?: Citation[];
  feedback?: MessageFeedback;
  tokens?: number;
  streamingComplete?: boolean;
}

export interface MessageFeedback {
  id: string;
  messageId: string;
  type: 'like' | 'dislike';
  rating?: number; // 1-10
  positiveComments?: string[];
  negativeComments?: string[];
  freeTextComment?: string;
  isAnonymous?: boolean;
  timestamp: Date;
}

export interface Conversation {
  id: string;
  title: string;
  summary?: string;
  messages: Message[];
  modelId: string;
  documents: Document[];
  createdAt: Date;
  updatedAt: Date;
  isPinned?: boolean;
  isArchived?: boolean;
  tags?: string[];
}

export interface ChatHistoryFilter {
  dateRange?: {
    start: Date;
    end: Date;
  };
  modelIds?: string[];
  hasDocuments?: boolean;
  hasFeedback?: boolean;
  tags?: string[];
  searchQuery?: string;
}

export interface StreamingResponse {
  id: string;
  conversationId: string;
  messageId: string;
  chunk: string;
  isComplete: boolean;
  metadata?: {
    tokensPerSecond?: number;
    totalTokens?: number;
    citations?: Citation[];
  };
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  defaultModel: string;
  autoSave: boolean;
  showTimestamps: boolean;
  fontSize: 'small' | 'medium' | 'large';
  enableNotifications: boolean;
  retentionPeriod: number; // days
}

export interface FeedbackOption {
  id: string;
  label: string;
  type: 'positive' | 'negative';
}

export const POSITIVE_FEEDBACK_OPTIONS: FeedbackOption[] = [
  { id: 'helpful', label: 'Helpful', type: 'positive' },
  { id: 'accurate', label: 'Accurate', type: 'positive' },
  { id: 'well-formatted', label: 'Well-formatted', type: 'positive' },
  { id: 'complete', label: 'Complete', type: 'positive' },
];

export const NEGATIVE_FEEDBACK_OPTIONS: FeedbackOption[] = [
  { id: 'unhelpful', label: 'Unhelpful', type: 'negative' },
  { id: 'inaccurate', label: 'Inaccurate', type: 'negative' },
  { id: 'poor-formatting', label: 'Poor formatting', type: 'negative' },
  { id: 'incomplete', label: 'Incomplete', type: 'negative' },
];
