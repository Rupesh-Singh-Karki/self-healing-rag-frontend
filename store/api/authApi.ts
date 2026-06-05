import { baseApi } from "./baseApi";
import type { AuthUser } from "../slices/authSlice";

interface LoginRequest {
  email: string;
  password: string;
}

interface SignupRequest {
  fullName: string;
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  user: AuthUser;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body,
      }),
    }),

    signup: builder.mutation<AuthResponse, SignupRequest>({
      query: (body) => ({
        url: "/auth/signup",
        method: "POST",
        body,
      }),
    }),

    getMe: builder.query<AuthUser, void>({
      query: () => "/auth/me",
    }),

    logout: builder.mutation<{ success: boolean }, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useSignupMutation,
  useGetMeQuery,
  useLazyGetMeQuery,
  useLogoutMutation,
} = authApi;
