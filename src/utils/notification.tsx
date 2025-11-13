import { Dispatch } from "@reduxjs/toolkit";

// API
import { addNotification, removeNotification } from "../features/notification/notificationSlice";

// Utils
import { showToast } from "./commonFunction";
import { toastChannel } from "./channel";

type NotificationToastParams = {
  dispatch: Dispatch;
  type: "newCheckpoint" | "newCamera" | "requestDelete" | "cameraOnline" | "cameraOffline";
  component: React.FC<any>;
  theme?: "dark" | "light";
  style?: Record<string, string>;
  title?: string;
  content: string | string[];
  variables?: Record<string, any>;
  isOnline?: boolean;
  messageId: string;
  updateAction?: () => void;
  closeAction?: string; // e.g. "closeUpdateAlert"
  extra?: Record<string, any>;
  isAddNotification?: boolean;
};

export const createNotificationToast = ({
  dispatch,
  type,
  component,
  theme = "dark",
  style,
  title = "",
  content,
  variables,
  isOnline,
  messageId,
  updateAction,
  closeAction,
  extra,
  isAddNotification = true,
}: NotificationToastParams) => {
  const toastId = `notification-list-toast-${messageId}`;

  if (isAddNotification) {
    dispatch(
      addNotification({
        id: toastId,
        userId: "",
        type,
        title,
        content: Array.isArray(content) ? content : [content],
        variables,
        messageId,
        isOnline,
        ...extra,
      })
    );
  }

  const data = {
    title,
    content,
    variables,
    isOnline,
    updateVisible: true,
    onUpdate: (toastId: string) => {
      if (updateAction) updateAction();

      const updatedData = {
        updateVisible: false,
        isSuccess: true,
        theme,
        style,
        title,
        content,
        variables,
        isOnline,
      };

      toastChannel.postMessage({
        id: toastId,
        action: closeAction ?? "closeUpdateAlert",
        data: updatedData,
      });

      dispatch(removeNotification(toastId));
    },
  };

  showToast(component, data, theme, toastId, style);
};
