import { useEffect } from "react";

let globalSse: EventSource | null = null;

export function useSse(
  url: string,
  token: string,
  eventName: string,
  onMessage: (data: any) => void,
  isPgNotify: boolean = true,
  onError?: (err: any) => void,
) {
  useEffect(() => {
    if (!url || !eventName) return;

    const finalUrl = token
      ? `${url}${url.includes("?") ? "&" : "?"}token=${encodeURIComponent(token)}`
      : url;

    if (!globalSse) {
      globalSse = new EventSource(finalUrl, { withCredentials: false });
    }

    const handler = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(isPgNotify ? 
          data.operation === "DELETE" ? data.data.old : data.data.new 
          : data.data);
      } catch (err) {
        console.error("Failed to parse SSE data:", err);
      }
    };

    globalSse.addEventListener(eventName, handler);

    if (onError) {
      globalSse.onerror = onError;
    }

    return () => {
      globalSse?.removeEventListener(eventName, handler);
    };
  }, [url, token, eventName, onMessage, onError]);
}