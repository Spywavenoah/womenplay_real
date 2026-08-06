import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    env: {
      DB_FILE: "tests/.test-database.json",
      JWT_SECRET: "vitest-secret-key-for-tests-1234567890-abcdefghijk",
      NODE_ENV: "test",
      AUTH_RATE_LIMIT_MAX: "10000",
    },
    fileParallelism: false,
  },
});
