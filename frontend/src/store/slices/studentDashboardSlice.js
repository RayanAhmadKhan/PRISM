import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  confidenceLevel: 96,
  attendanceHistory: [],
};

const studentDashboardSlice = createSlice({
  name: 'studentDashboard',
  initialState,
  reducers: {
    setConfidenceLevel(state, action) {
      state.confidenceLevel = action.payload;
    },
    setAttendanceHistory(state, action) {
      state.attendanceHistory = action.payload;
    },
  },
});

export const { setConfidenceLevel, setAttendanceHistory } = studentDashboardSlice.actions;

export default studentDashboardSlice.reducer;

