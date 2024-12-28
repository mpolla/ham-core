import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      include: ["{apps,packages}/*/src/**"],
    },
  },
});
