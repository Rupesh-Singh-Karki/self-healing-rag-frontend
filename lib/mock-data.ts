import { Message, Chunk, CriticResult, TraceStep } from "@/types";

export const MOCK_CHUNKS: Chunk[] = [
  {
    id: "chunk-001",
    text: "Employees are entitled to 20 days of paid time off per calendar year, accruing at 1.67 days per month. Unused PTO may be carried over up to a maximum of 10 days into the following year.",
    page: 14,
    document_name: "Employee_Handbook_2024.pdf",
    score: 0.94,
  },
  {
    id: "chunk-002",
    text: "PTO requests must be submitted at least 5 business days in advance through the HR portal. Emergency leave is handled separately under Section 7.3 of this handbook.",
    page: 15,
    document_name: "Employee_Handbook_2024.pdf",
    score: 0.87,
  },
  {
    id: "chunk-003",
    text: "Part-time employees working more than 20 hours per week accrue PTO at 50% of the full-time rate. Contract employees are not eligible for PTO under this policy.",
    page: 16,
    document_name: "Employee_Handbook_2024.pdf",
    score: 0.71,
  },
];

export const MOCK_CRITIC: CriticResult = {
  score: 0.91,
  grounded: true,
  issues: [],
};

export const MOCK_CRITIC_RETRY: CriticResult = {
  score: 0.61,
  grounded: false,
  issues: ["missing_evidence", "unsupported_claims"],
};

export const MOCK_TRACE_SIMPLE: TraceStep[] = [
  { node: "retrieve", status: "done" },
  { node: "generate", status: "done" },
  { node: "critic", status: "done" },
];

export const MOCK_TRACE_RETRY: TraceStep[] = [
  { node: "retrieve", status: "done" },
  { node: "generate", status: "done" },
  { node: "critic", status: "done" },
  { node: "rewrite", status: "done" },
  { node: "retrieve", status: "done" },
  { node: "generate", status: "done" },
  { node: "critic", status: "done" },
];

export const MOCK_TRACE_REFUSED: TraceStep[] = [
  { node: "retrieve", status: "done" },
  { node: "generate", status: "done" },
  { node: "critic", status: "done" },
  { node: "rewrite", status: "done" },
  { node: "retrieve", status: "done" },
  { node: "generate", status: "done" },
  { node: "critic", status: "done" },
  { node: "refuse", status: "done" },
];

export const MOCK_MESSAGES: Message[] = [
  {
    id: "msg-1",
    role: "user",
    content: "What is the PTO policy for full-time employees?",
    timestamp: new Date(Date.now() - 60000),
  },
  {
    id: "msg-2",
    role: "assistant",
    content:
      "Full-time employees receive 20 days of paid time off per calendar year, accruing at 1.67 days per month. You can carry over up to 10 unused days into the following year. Requests must be submitted at least 5 business days in advance via the HR portal.",
    timestamp: new Date(Date.now() - 55000),
    sources: MOCK_CHUNKS,
    critic: MOCK_CRITIC,
    trace: MOCK_TRACE_SIMPLE,
    retries: 0,
    final_status: "returned",
  },
  {
    id: "msg-3",
    role: "user",
    content: "What about the parental leave policy?",
    timestamp: new Date(Date.now() - 30000),
  },
  {
    id: "msg-4",
    role: "assistant",
    content:
      "I could not find sufficient evidence in the indexed documents to answer this question confidently. Please try rephrasing, or ensure the relevant document has been uploaded.",
    timestamp: new Date(Date.now() - 25000),
    sources: [],
    critic: { score: 0.28, grounded: false, issues: ["missing_evidence"] },
    trace: MOCK_TRACE_REFUSED,
    retries: 2,
    final_status: "refused",
  },
];

export const MOCK_INDEXED_DOCS = [
  {
    name: "Employee_Handbook_2024.pdf",
    pages: 48,
    chunks: 142,
    status: "indexed" as const,
  },
  {
    name: "Benefits_Overview_Q4.pdf",
    pages: 12,
    chunks: 38,
    status: "indexed" as const,
  },
  {
    name: "Remote_Work_Policy.pdf",
    pages: 6,
    chunks: 19,
    status: "indexed" as const,
  },
];
