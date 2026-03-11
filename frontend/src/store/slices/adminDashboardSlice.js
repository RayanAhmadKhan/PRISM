import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  users: [],
  auditLogs: [],
};

const adminDashboardSlice = createSlice({
  name: 'adminDashboard',
  initialState,
  reducers: {
    setUsers(state, action) {
      state.users = action.payload;
    },
    setAuditLogs(state, action) {
      state.auditLogs = action.payload;
    },
  },
});

export const { setUsers, setAuditLogs } = adminDashboardSlice.actions;

export default adminDashboardSlice.reducer;

