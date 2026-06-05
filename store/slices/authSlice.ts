import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  joinedAt: string;
  avatarInitials: string;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isHydrated: boolean;
}

function loadToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
}

function loadUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("auth_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

const initialState: AuthState = {
  token: null,
  user: null,
  isHydrated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    /** Called on app mount to hydrate from localStorage */
    hydrateAuth(state) {
      state.token = loadToken();
      state.user = loadUser();
      state.isHydrated = true;
    },
    setCredentials(
      state,
      action: PayloadAction<{ token: string; user: AuthUser }>
    ) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      localStorage.setItem("auth_token", action.payload.token);
      localStorage.setItem(
        "auth_user",
        JSON.stringify(action.payload.user)
      );
    },
    clearCredentials(state) {
      state.token = null;
      state.user = null;
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
    },
  },
});

export const { hydrateAuth, setCredentials, clearCredentials } =
  authSlice.actions;
export default authSlice.reducer;
