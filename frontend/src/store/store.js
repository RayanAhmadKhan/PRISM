import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import studentDashboardSlice from './slices/studentDashboardSlice';
import teacherDashboardSlice from './slices/teacherDashboardSlice';
import adminDashboardSlice from './slices/adminDashboardSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    studentDashboard: studentDashboardSlice,
    teacherDashboard: teacherDashboardSlice,
    adminDashboard: adminDashboardSlice,
  },
});

