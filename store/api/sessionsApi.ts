import { baseApi } from "./baseApi";

// ─── Types ───

interface LandingData {
  indexedDocumentCount: number;
  suggestions: string[];
}

interface Session {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
  messageCount: number;
}

interface ListSessionsResponse {
  sessions: Session[];
  total: number;
  page: number;
}

interface CreateSessionResponse {
  id: string;
  title: string;
}

interface RenameSessionResponse {
  id: string;
  title: string;
}

interface SessionMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  sources?: Array<{
    id: string;
    text: string;
    page: number;
    document_name: string;
    score: number;
  }> | null;
  critic?: {
    score: number;
    grounded: boolean;
    issues: string[];
  } | null;
  trace?: Array<{
    node: string;
    status: string;
  }> | null;
  retries?: number | null;
  final_status?: string | null;
}

interface GetSessionMessagesResponse {
  session: {
    id: string;
    title: string;
  };
  messages: SessionMessage[];
}

// ─── API Endpoints ───

export const sessionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLanding: builder.query<LandingData, void>({
      query: () => "/chat/landing",
      providesTags: ["Landing"],
    }),

    listSessions: builder.query<
      ListSessionsResponse,
      { page?: number; limit?: number } | void
    >({
      query: (params) => ({
        url: "/sessions",
        params: params || undefined,
      }),
      providesTags: ["Sessions"],
    }),

    getSessionMessages: builder.query<GetSessionMessagesResponse, string>({
      query: (sessionId) => `/sessions/${sessionId}/messages`,
      providesTags: (_result, _error, sessionId) => [
        { type: "SessionMessages", id: sessionId },
      ],
    }),

    createSession: builder.mutation<CreateSessionResponse, string>({
      query: (initialMessage) => ({
        url: "/sessions",
        method: "POST",
        body: { initialMessage },
      }),
      invalidatesTags: ["Sessions"],
    }),

    renameSession: builder.mutation<
      RenameSessionResponse,
      { sessionId: string; title: string }
    >({
      query: ({ sessionId, title }) => ({
        url: `/sessions/${sessionId}`,
        method: "PATCH",
        body: { title },
      }),
      invalidatesTags: ["Sessions"],
    }),

    deleteSession: builder.mutation<{ success: boolean }, string>({
      query: (sessionId) => ({
        url: `/sessions/${sessionId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Sessions"],
    }),
  }),
});

export const {
  useGetLandingQuery,
  useListSessionsQuery,
  useGetSessionMessagesQuery,
  useCreateSessionMutation,
  useRenameSessionMutation,
  useDeleteSessionMutation,
} = sessionsApi;
