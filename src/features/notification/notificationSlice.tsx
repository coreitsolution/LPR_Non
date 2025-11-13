import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Id } from 'react-toastify';

export type NotificationType = "newCheckpoint" | "newCamera" | "requestDelete" | "cameraOnline" | "cameraOffline";

export interface NotificationData {
  id: string;
  userId: string;
  type: NotificationType;
  messageId: string;
  title: string;
  content?: string | string[];
  variables?: Record<string, any>;
  isOnline?: boolean;
}

interface NotificationState {
  list: NotificationData[];
}

const initialState: NotificationState = {
  list: [],
};

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<NotificationData>) => {
      state.list.push(action.payload);
    },
    removeNotification: (state, action: PayloadAction<Id>) => {
      state.list = state.list.filter((n) => n.id !== action.payload);
    },
    clearNotificationsByUser: (state, action: PayloadAction<string>) => {
      state.list = state.list.filter((n) => n.userId !== action.payload);
    },
  },
});

export const { 
  addNotification, 
  removeNotification, 
  clearNotificationsByUser 
} = notificationSlice.actions;

export default notificationSlice.reducer;
