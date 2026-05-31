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
  final_status?: "returned" | "refused" | "in_progress";
};

export type StreamingState = {
  status: "idle" | "streaming" | "done" | "error";
  activeNode?: string;
};
