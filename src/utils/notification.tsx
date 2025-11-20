import { Dispatch } from "@reduxjs/toolkit";

// API
import { removeNotification, addNotification, NotificationType } from "../features/notification/notificationSlice";

// Utils
import { showToast } from "./commonFunction";
import { toastChannel } from "./channel";
import { fetchClient, combineURL } from "./fetchClient";

// Types
import { EventNotifyResponse } from "../features/types";

// Config
import { getUrls } from '../config/runtimeConfig';

type NotificationToastParams = {
  dispatch: Dispatch;
  component: React.FC<any>;
  theme?: "dark" | "light";
  type: NotificationType;
  style?: Record<string, string>;
  title?: string;
  content: string | string[];
  variables?: Record<string, any>;
  isOnline?: boolean;
  messageId: string;
  id: number;
  updateAction?: () => void;
  closeAction?: string;
};

export const createNotificationToast = ({
  dispatch,
  component,
  type,
  theme = "dark",
  style,
  title = "",
  content,
  variables,
  isOnline,
  messageId,
  id,
  updateAction,
  closeAction,
}: NotificationToastParams) => {
  const toastId = `notification-list-toast-${messageId}`;

  dispatch(
    addNotification({
      id,
      userId: "",
      type,
      title,
      content: Array.isArray(content) ? content : [content],
      variables,
      messageId,
      isOnline,
      closeAction,
      theme,
      style,
    })
  );

  const data = {
    title,
    content,
    variables,
    isOnline,
    updateVisible: true,
    onUpdate: async (toastId: string) => {
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
        toastId,
        id,
        messageId,
        action: closeAction ?? "closeUpdateAlert",
        data: updatedData,
      });

      await confirmNotification(id, messageId, dispatch);
    },
  };

  showToast(component, data, theme, toastId, style);
};


export const confirmNotification = async (id: number, messageId: string, dispatch: Dispatch) => {
  const { CENTER_API } = getUrls();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  dispatch(removeNotification(messageId));
  try {

    const body = JSON.stringify({
      id: id,
      is_confirm: true
    })

    await fetchClient<EventNotifyResponse>(combineURL(CENTER_API, "/event-notify/update"), {
      method: "PATCH",
      signal: controller.signal,
      body,
    })
  }
  catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error(errorMessage)
  }
  finally {
    clearTimeout(timeoutId);
  }
}