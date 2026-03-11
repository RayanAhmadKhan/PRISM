import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  role: null, // 'student' | 'teacher' | 'admin'
  rememberMe: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login(state, action) {
      state.user = action.payload.user;
      state.role = action.payload.role;
      state.rememberMe = action.payload.rememberMe ?? false;
    },
    logout() {
      return initialState;
    },
  },
});

export const { login, logout } = authSlice.actions;

export default authSlice.reducer;

