import { createAsyncThunk } from "@reduxjs/toolkit";
import type { RootState } from "../index";
import {
  startStream,
  streamTokenReceived,
  streamChunksReceived,
  streamTraceUpdated,
  streamCriticReceived,
  streamCompleted,
  streamError,
  addUserMessage,
  addAssistantPlaceholder,
} from "../slices/chatSlice";

/**
 * Thunk that sends a message to a session and processes the SSE stream.
 * Dispatches incremental Redux actions as SSE events arrive.
 */
export const sendMessage = createAsyncThunk<
  void,
  { sessionId: string; content: string },
  { state: RootState }
>(
  "chat/sendMessage",
  async ({ sessionId, content }, { getState, dispatch }) => {
    const token = getState().auth.token;
    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    // Optimistic UI: add user + placeholder assistant messages
    const userMsgId = `msg-${Date.now()}-user`;
    const assistantMsgId = `msg-${Date.now()}-assistant`;

    dispatch(addUserMessage({ id: userMsgId, content }));
    dispatch(addAssistantPlaceholder({ id: assistantMsgId }));
    dispatch(startStream());

    try {
      const response = await fetch(
        `${baseUrl}/sessions/${sessionId}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content }),
        }
      );

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        const message =
          typeof errorBody.detail === "string"
            ? errorBody.detail
            : "Failed to send message";
        dispatch(streamError(message));
        return;
      }

      if (!response.body) {
        dispatch(streamError("No response body"));
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || ""; // Keep incomplete line in buffer

        let currentEvent = "";

        for (const line of lines) {
          if (line.startsWith("event: ")) {
            currentEvent = line.slice(7).trim();
          } else if (line.startsWith("data: ")) {
            const rawData = line.slice(6);
            try {
              const data = JSON.parse(rawData);

              switch (currentEvent) {
                case "trace":
                  dispatch(
                    streamTraceUpdated({
                      node: data.node,
                      status: data.status,
                    })
                  );
                  break;

                case "chunks":
                  dispatch(streamChunksReceived(data));
                  break;

                case "token":
                  const stateForToken = getState();
                  if (stateForToken.chat.activeNode === "generate") {
                    dispatch(streamTokenReceived(data.token));
                  }
                  break;

                case "critic":
                  dispatch(streamCriticReceived(data));
                  break;

                case "done":
                  dispatch(
                    streamCompleted({
                      final_status: data.final_status || "returned",
                      retries: data.retries || 0,
                    })
                  );
                  break;

                case "error":
                  dispatch(streamError(data.message || "Stream error"));
                  break;

                default:
                  break;
              }
            } catch {
              // Skip malformed JSON lines
            }
          }
        }
      }

      // If we exited the loop without a "done" event, finalize
      const state = getState();
      if (state.chat.streamStatus === "streaming") {
        dispatch(
          streamCompleted({ final_status: "returned", retries: 0 })
        );
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Network error";
      dispatch(streamError(message));
    }
  }
);
