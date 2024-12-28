import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
  "packages/*",
  {
    test: {
      include: ["apps/*/src/**/*.{test,spec}.{ts,js}"],
    },
  },
]);
