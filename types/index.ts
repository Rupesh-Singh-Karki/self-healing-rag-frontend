export type TraceStep = {
  node: "retrieve" | "generate" | "critic" | "rewrite" | "refuse";
  status: "started" | "done";
};

export type Chunk = {
  id: string;
  text: string;
  page: number;
  document_name: string;
  score: number;
};

export type CriticResult = {
  score: number;
  grounded: boolean;
  issues: string[];
};

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  // Only on assistant messages
  sources?: Chunk[];
  critic?: CriticResult;
  trace?: TraceStep[];
  retries?: number;
  final_status?: "returned" | "refused" | "retried" | "in_progress";
};

export type StreamingState = {
  status: "idle" | "streaming" | "done" | "error";
  activeNode?: string;
};

// ─── API Response Types ───

export type User = {
  id: string;
  fullName: string;
  email: string;
  joinedAt: string;
  avatarInitials: string;
};

export type Session = {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
  messageCount: number;
};

export type LandingData = {
  indexedDocumentCount: number;
  suggestions: string[];
};

export type Analytics = {
  totalSessions: number;
  totalQueries: number;
  avgConfidence: number;
  approvedAnswers: number;
  retriedAnswers: number;
  refusedAnswers: number;
  docsIndexed: number;
  totalChunksIndexed: number;
};

export type DocumentItem = {
  id: string;
  name: string;
  size: string;
  pages: number;
  chunks: number;
  uploadedAt: string;
  status: string;
  downloadUrl: string;
};

export type IndexedDocument = {
  name: string;
  pages: number;
  chunks: number;
  status: string;
};
