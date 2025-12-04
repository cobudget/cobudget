import createCache from "@emotion/cache";

// Create Emotion cache with prepend option for proper MUI CSS injection order
export default function createEmotionCache() {
  return createCache({ key: "css", prepend: true });
}
