import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@prisma/client": path.resolve(__dirname, "stubs/prisma-client"),
    },
  },
  test: {
    environment: "node",
    globals: true,
    setupFiles: [],
    include: ["tests/**/*.test.ts"],
  },
});
