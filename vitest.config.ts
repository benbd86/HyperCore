import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    include: ["backend/tests/**/*.test.ts"],
    environment: "node",
    globals: true,
  },
  resolve: {
    alias: {
      "@backend": path.resolve(__dirname, "backend"),
    },
  },
});
