import { createClient } from "@sanity/client";

export const db = createClient({
  dataset: "production",
  projectId: import.meta.env.VITE_PROJECT_ID,
  apiVersion: import.meta.env.VITE_VERSION_API,
  token: import.meta.env.VITE_API_TOKEN,
  useCdn: false,
  ignoreBrowserTokenWarning: true,
});

