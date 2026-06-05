import { baseApi } from "./baseApi";
import type { AuthUser } from "../slices/authSlice";

// ─── Types ───

interface Analytics {
  totalSessions: number;
  totalQueries: number;
  avgConfidence: number;
  approvedAnswers: number;
  retriedAnswers: number;
  refusedAnswers: number;
  docsIndexed: number;
  totalChunksIndexed: number;
}

interface ProfileResponse {
  user: AuthUser;
  analytics: Analytics;
}

// ─── API Endpoints ───

export const profileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyProfile: builder.query<ProfileResponse, void>({
      query: () => "/profile/me",
      providesTags: ["Profile"],
    }),
  }),
});

export const { useGetMyProfileQuery } = profileApi;
