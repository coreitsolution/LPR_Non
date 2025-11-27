import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Id } from 'react-toastify';

export type NotificationType = "newCheckpoint" | "newCamera" | "requestDelete" | "cameraOnline" | "cameraOffline";

export interface NotificationData {
  id: number;
  userId: string;
  type: NotificationType;
  messageId: string;
  title: string;
  content?: string | string[];
  variables?: Record<string, any>;
  isOnline?: boolean;
  theme?: "dark" | "light";
  style?: Record<string, string>;
  closeAction?: string;
}

interface NotificationState {
  list: NotificationData[];
  countAll: number;
}

const MAX_ITEMS = 100;

const initialState: NotificationState = {
  list: [],
  countAll: 0,
};

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<NotificationData>) => {
      const exists = state.list.some(
        (n) => n.messageId === action.payload.messageId
      );

      if (!exists) {
        state.list.unshift(action.payload);
        state.countAll += 1;

        if (state.list.length > MAX_ITEMS) {
          state.list = state.list.slice(0, MAX_ITEMS);
        }
      }
    },
    addListNotification: (state, action: PayloadAction<NotificationState>) => {
      state.list = action.payload.list.slice(0, MAX_ITEMS);
      state.countAll = action.payload.countAll;
    },
    removeNotification: (state, action: PayloadAction<Id>) => {
      state.list = state.list.filter((n) => n.messageId !== action.payload);
    },
    clearNotificationsByUser: (state, action: PayloadAction<string>) => {
      state.list = state.list.filter((n) => n.userId !== action.payload);
    },
  },
});

export const { 
  addNotification,
  addListNotification,
  removeNotification, 
  clearNotificationsByUser 
} = notificationSlice.actions;

export default notificationSlice.reducer;
