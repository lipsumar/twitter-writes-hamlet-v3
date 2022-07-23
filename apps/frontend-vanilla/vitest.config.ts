/// <reference types="vitest" />
import { defineConfig } from "vite";

export default defineConfig({
  test: {
    outputTruncateLength: 3000,
    environment: "jsdom",
  },
});
