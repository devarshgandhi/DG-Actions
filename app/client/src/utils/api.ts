const LOCAL_API_SERVER_URL = 'http://localhost:5100';

function normalizeApiServerUrl(url: string): string {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

export function getApiServerUrl(): string {
  const configuredApiServerUrl = process.env.API_SERVER_URL;

  if (configuredApiServerUrl) {
    return normalizeApiServerUrl(configuredApiServerUrl);
  }

  if (import.meta.env.DEV) {
    return LOCAL_API_SERVER_URL;
  }

  throw new Error('API_SERVER_URL is not configured for the Astro server process.');
}