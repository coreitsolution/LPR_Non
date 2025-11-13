let config: Record<string, any> | null = null;

export async function loadConfig(): Promise<void> {
  const res = await fetch('/config.json');
  if (!res.ok) {
    throw new Error(`Failed to load config: ${res.status}`);
  }
  config = await res.json();
}

export function getConfig() {
  if (!config) {
    throw new Error('Config not loaded yet');
  }
  return config;
}

export function getUrls() {
  const cfg = getConfig();

  return {
    CENTER_API: `${cfg.CENTER_API}/lpr-center-api/${cfg.CENTER_API_VERSION}`,
    CENTER_TOKEN: cfg.CENTER_TOKEN,
    CENTER_KAFKA_URL: cfg.CENTER_KAFKA_URL,
    CENTER_FILE_URL: cfg.CENTER_FILE_URL,
    CENTER_OSRM_URL: cfg.CENTER_OSRM_URL,
    CENTER_SETTING_WEBSOCKET_URL: cfg.CENTER_SETTING_WEBSOCKET_URL,
    CENTER_SETTING_WEBSOCKET_TOKEN: cfg.CENTER_SETTING_WEBSOCKET_TOKEN,
    PROJECT_NAME: cfg.PROJECT_NAME,
    NAV_LOGO_BG_WHITE: cfg.NAV_LOGO_BG_WHITE,
  };
}