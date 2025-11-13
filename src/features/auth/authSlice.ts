import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { AuthData } from './authTypes'
import { loginUser, logoutUser, refreshToken, getUserInfo } from './authAPI'
import { Status } from "../../constants/statusEnum"

interface AuthState {
  authData: AuthData
  authStatus: Status
  authError: string | null
}

const initialState: AuthState = {
  authData: { 
    token: localStorage.getItem("token") || null,
    isAuthenticated: !!localStorage.getItem("token"),
    userInfo: null,
    userId: 0,
  },
  authStatus: Status.IDLE,
  authError: null,
}

export const login = createAsyncThunk<
  any,
  { username: string; password: string },
  { rejectValue: { status: number; message: string } }
>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await loginUser(credentials);
      return response;
    } catch (error: any) {
      return rejectWithValue({
        status: error.status || 500,
        message: error.message || 'Login failed',
      });
    }
  }
);

export const userInfo = createAsyncThunk(
  'auth/getUserInfo',
  async (param?: Record<string, string>) => {
    const response = await getUserInfo(param)
    return response
  }
)


export const refresh = createAsyncThunk(
  'auth/refresh',
  async () => {
    const response = await refreshToken()
    return response
  }
)

export const logout = createAsyncThunk('auth/logout', async () => {
  return await logoutUser()
})

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.authError = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.authStatus = Status.LOADING
        state.authError = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.authStatus = Status.SUCCEEDED
        state.authData.isAuthenticated = true
        state.authData.token = action.payload.accessToken || null
        state.authData.userId = action.payload.userId || 0
        state.authData.userInfo = null
        localStorage.setItem('token', action.payload.accessToken)
        localStorage.setItem('userId', action.payload.userId.toString())
      })
      .addCase(login.rejected, (state, action) => {
        state.authStatus = Status.FAILED
        const payload = action.payload as { status?: number; message?: string } | undefined;

        if (payload?.status === 401) {
          state.authError = 'Invalid username or password';
        } else {
          state.authError = payload?.message || action.error.message || 'Login failed';
        }
      })

      .addCase(userInfo.pending, (state) => {
        state.authStatus = Status.LOADING
        state.authError = null
      })
      .addCase(userInfo.fulfilled, (state, action) => {
        state.authStatus = Status.SUCCEEDED
        state.authData.userInfo = action.payload.data[0] || null
      })
      .addCase(userInfo.rejected, (state, action) => {
        state.authStatus = Status.FAILED
        state.authError = action.error.message || 'Login failed'
      })

      .addCase(refresh.pending, (state) => {
        state.authStatus = Status.LOADING
        state.authError = null
      })
      .addCase(refresh.fulfilled, (state, action) => {
        state.authStatus = Status.SUCCEEDED
        state.authData.isAuthenticated = true
        state.authData.token = action.payload.accessToken || null
        localStorage.setItem('token', action.payload.accessToken)
      })
      .addCase(refresh.rejected, (state, action) => {
        state.authStatus = Status.FAILED
        state.authError = action.error.message || 'Login failed'
      })

      .addCase(logout.fulfilled, (state, action) => {
        if (action.payload.success) {
          state.authData.token = null;
          state.authData.isAuthenticated = false;
          state.authData.userInfo = null;
          state.authData.userId = 0
          localStorage.removeItem("token");
          localStorage.removeItem("userId");
        }
      })
  },
})

export const { clearError } = authSlice.actions
export default authSlice.reducer