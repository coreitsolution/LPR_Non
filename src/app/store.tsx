import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import dropdownReducer from "../features/dropdown/dropdownSlice";
import realtimeDataReducer from "../features/realtime-data/realtimeDataSlice";
import refreshReducer from "../features/refresh/refreshSlice";
import specialPlateReducer from "../features/special-plate/specialPlateSlice";
import notificationReducer from "../features/notification/notificationSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dropdownData: dropdownReducer,
    realTimeData: realtimeDataReducer,
    refresh: refreshReducer,
    specialPlateData: specialPlateReducer,
    notification: notificationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
