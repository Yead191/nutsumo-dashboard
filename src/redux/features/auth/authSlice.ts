import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { TOKEN_KEY, USER_KEY } from "@/config";
import type { RootState } from "../../store";
import type { AuthState, AuthUser } from "./auth.types";

const readToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

const readUser = (): AuthUser | null => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const initialState: AuthState = {
  user: readUser(),
  token: readToken(),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: AuthUser | null; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      try {
        localStorage.setItem(TOKEN_KEY, action.payload.token);
        if (action.payload.user) {
          localStorage.setItem(USER_KEY, JSON.stringify(action.payload.user));
        }
      } catch {
        // ignore storage errors
      }
    },
    setUser: (state, action: PayloadAction<AuthUser | null>) => {
      state.user = action.payload;
      try {
        if (action.payload) {
          localStorage.setItem(USER_KEY, JSON.stringify(action.payload));
        } else {
          localStorage.removeItem(USER_KEY);
        }
      } catch {
        // ignore
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      try {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      } catch {
        // ignore
      }
    },
  },
});

export const { setCredentials, setUser, logout } = authSlice.actions;
export const authReducer = authSlice.reducer;

export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectCurrentToken = (state: RootState) => state.auth.token;
export const selectIsAuthenticated = (state: RootState) => !!state.auth.token;
