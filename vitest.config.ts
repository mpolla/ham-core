import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      include: ["{apps,packages}/*/src/**"],
      exclude: ["**/+*.*", "**/*.svelte", "**/*.{d,test,spec}.ts"],
    },
  },
});
