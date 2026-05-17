import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authApi, accountsApi } from "../../utils/api/api";

// ==========================================
// THUNKS
// ==========================================

export const login = createAsyncThunk(
  "auth/login",
  async ({ username, password }, { dispatch, rejectWithValue }) => {
    try {
      const res = await authApi.login(username, password);
      localStorage.setItem("access_token",  res.data.access);
      localStorage.setItem("refresh_token", res.data.refresh);
      console.log(res.data)
      // Tự động fetch user sau khi login
      await dispatch(fetchMe());
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { error: "Đăng nhập thất bại" });
    }
  }
);

export const register = createAsyncThunk(
  "auth/register",
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await authApi.register(formData);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { error: "Đăng ký thất bại" });
    }
  }
);

export const fetchMe = createAsyncThunk(
  "auth/fetchMe",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await accountsApi.getMe();
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

export const updateMe = createAsyncThunk(
  "auth/updateMe",
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await accountsApi.updateMe(formData);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

// ==========================================
// SLICE
// ==========================================

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user:       null,
    isLoggedIn: !!localStorage.getItem("access_token"),
    loading:    false,
    error:      null,
  },
  reducers: {
    logout(state) {
      state.user       = null;
      state.isLoggedIn = false;
      state.error      = null;
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {

    // ── login ──────────────────────────────
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(login.fulfilled, (state) => {
        state.loading    = false;
        state.isLoggedIn = true;
        // user đã được set bởi fetchMe dispatch bên trong
      })
      .addCase(login.rejected, (state, action) => {
        state.loading    = false;
        state.isLoggedIn = false;
        state.error      = action.payload;
      });

    // ── register ───────────────────────────
    builder
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      });

    // ── fetchMe ────────────────────────────
    builder
      .addCase(fetchMe.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.loading    = false;
        state.isLoggedIn = true;
        state.user       = action.payload;
      })
      .addCase(fetchMe.rejected, (state) => {
        state.loading    = false;
        state.isLoggedIn = false;
        state.user       = null;
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      });

    // ── updateMe ───────────────────────────
    builder
      .addCase(updateMe.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  },
});

export const { logout, clearError } = authSlice.actions;

// Selectors
export const selectUser        = (state) => state.auth.user;
export const selectIsLoggedIn  = (state) => state.auth.isLoggedIn;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError   = (state) => state.auth.error;

export default authSlice.reducer;