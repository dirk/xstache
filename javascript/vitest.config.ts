import { coverageConfigDefaults, defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        projects: ["packages/xstache", "packages/@xstache/*"],
        coverage: {
            exclude: [...coverageConfigDefaults.exclude, "**/dist/**"],
        },
    },
});
