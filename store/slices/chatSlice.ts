import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Chunk, CriticResult, TraceStep } from "@/types";

interface ChatState {
  /** Messages loaded from the API for the current session */
  messages: Array<{
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: string;
    sources?: Chunk[];
    critic?: CriticResult | null;
    trace?: TraceStep[];
    retries?: number;
    final_status?: "returned" | "refused" | "retried" | "in_progress" | null;
  }>;

  /** Streaming state */
  streamingAnswer: string;
  streamingChunks: Chunk[];
  streamingTrace: TraceStep[];
  streamingCritic: CriticResult | null;
  streamStatus: "idle" | "streaming" | "done" | "error";
  activeNode: string | null;
  streamError: string | null;
}

const initialState: ChatState = {
  messages: [],
  streamingAnswer: "",
  streamingChunks: [],
  streamingTrace: [],
  streamingCritic: null,
  streamStatus: "idle",
  activeNode: null,
  streamError: null,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    /** Set messages loaded from API */
    setMessages(state, action: PayloadAction<ChatState["messages"]>) {
      state.messages = action.payload;
    },

    /** Add a user message optimistically */
    addUserMessage(
      state,
      action: PayloadAction<{ id: string; content: string }>
    ) {
      state.messages.push({
        id: action.payload.id,
        role: "user",
        content: action.payload.content,
        timestamp: new Date().toISOString(),
      });
    },

    /** Add a placeholder assistant message for streaming */
    addAssistantPlaceholder(state, action: PayloadAction<{ id: string }>) {
      state.messages.push({
        id: action.payload.id,
        role: "assistant",
        content: "",
        timestamp: new Date().toISOString(),
        sources: [],
        critic: null,
        trace: [],
        retries: 0,
        final_status: "in_progress",
      });
    },

    /** Begin streaming */
    startStream(state) {
      state.streamingAnswer = "";
      state.streamingChunks = [];
      state.streamingTrace = [];
      state.streamingCritic = null;
      state.streamStatus = "streaming";
      state.activeNode = null;
      state.streamError = null;
    },

    /** Append a token to the streaming answer */
    streamTokenReceived(state, action: PayloadAction<string>) {
      state.streamingAnswer += action.payload;
    },

    /** Store retrieved source chunks */
    streamChunksReceived(state, action: PayloadAction<Chunk[]>) {
      state.streamingChunks = action.payload;
    },

    /** Update pipeline trace */
    streamTraceUpdated(
      state,
      action: PayloadAction<{ node: string; status: string }>
    ) {
      const { node, status } = action.payload;

      if (status === "started") {
        state.activeNode = node;
        state.streamingTrace.push({
          node: node as TraceStep["node"],
          status: "started",
        });
      } else if (status === "done") {
        // Find the last "started" entry for this node and mark done
        for (let i = state.streamingTrace.length - 1; i >= 0; i--) {
          if (
            state.streamingTrace[i].node === node &&
            state.streamingTrace[i].status === "started"
          ) {
            state.streamingTrace[i].status = "done";
            break;
          }
        }
        if (state.activeNode === node) {
          state.activeNode = null;
        }
      }
    },

    /** Store critic result */
    streamCriticReceived(state, action: PayloadAction<CriticResult>) {
      state.streamingCritic = action.payload;
    },

    /** Finalize stream — update the last assistant message */
    streamCompleted(
      state,
      action: PayloadAction<{ final_status: string; retries: number }>
    ) {
      state.streamStatus = "done";
      state.activeNode = null;

      // Update the last assistant message with all streamed data
      const lastMsg = state.messages[state.messages.length - 1];
      if (lastMsg && lastMsg.role === "assistant") {
        lastMsg.content = state.streamingAnswer;
        lastMsg.sources = state.streamingChunks;
        lastMsg.critic = state.streamingCritic;
        lastMsg.trace = state.streamingTrace;
        lastMsg.retries = action.payload.retries;
        lastMsg.final_status = action.payload.final_status as
          | "returned"
          | "refused"
          | "retried";
      }
    },

    /** Handle stream error */
    streamError(state, action: PayloadAction<string>) {
      state.streamStatus = "error";
      state.activeNode = null;
      state.streamError = action.payload;
    },

    /** Reset streaming state */
    resetStream(state) {
      state.streamingAnswer = "";
      state.streamingChunks = [];
      state.streamingTrace = [];
      state.streamingCritic = null;
      state.streamStatus = "idle";
      state.activeNode = null;
      state.streamError = null;
    },

    /** Clear all messages (e.g. when navigating away) */
    clearMessages(state) {
      state.messages = [];
      state.streamingAnswer = "";
      state.streamingChunks = [];
      state.streamingTrace = [];
      state.streamingCritic = null;
      state.streamStatus = "idle";
      state.activeNode = null;
      state.streamError = null;
    },
  },
});

export const {
  setMessages,
  addUserMessage,
  addAssistantPlaceholder,
  startStream,
  streamTokenReceived,
  streamChunksReceived,
  streamTraceUpdated,
  streamCriticReceived,
  streamCompleted,
  streamError,
  resetStream,
  clearMessages,
} = chatSlice.actions;

export default chatSlice.reducer;
