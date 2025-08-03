import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["{apps,packages}/*/src/**/*.{test,spec}.{ts,js}"],
    coverage: {
      include: ["{apps,packages}/*/src/**"],
      exclude: ["**/+*.*", "**/*.svelte", "**/*.{d,test,spec}.ts"],
    },
  },
});
