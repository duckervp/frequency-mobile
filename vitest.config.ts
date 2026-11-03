import { defineConfig } from 'vitest/config';

// Pure-logic unit tests only (no React Native rendering). Pinned to UTC+7 so local time ≠ UTC.
process.env.TZ = 'Asia/Ho_Chi_Minh';

export default defineConfig({
    test: {
        include: ['src/**/*.test.ts'],
        environment: 'node',
    },
});
