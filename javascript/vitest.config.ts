import { coverageConfigDefaults, defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        projects: [
            "packages/rollup-plugin-xstache",
            "packages/xstache",
            "packages/@xstache/*",
        ],
        coverage: {
            exclude: [...coverageConfigDefaults.exclude, "**/dist/**"],
        },
    },
});
