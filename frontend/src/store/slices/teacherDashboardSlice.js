import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  flaggedCases: [],
  sessions: [],
};

const teacherDashboardSlice = createSlice({
  name: 'teacherDashboard',
  initialState,
  reducers: {
    setFlaggedCases(state, action) {
      state.flaggedCases = action.payload;
    },
    setSessions(state, action) {
      state.sessions = action.payload;
    },
  },
});

export const { setFlaggedCases, setSessions } = teacherDashboardSlice.actions;

export default teacherDashboardSlice.reducer;

