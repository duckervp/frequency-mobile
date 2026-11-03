// Guards the screens themselves: the helpers in time.ts are only useful if Register/Edit keep using them.
// (No React Native rendering in tests yet, so this checks the source.)
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

// No `new URL(...)` here: the DOM and Node URL types clash under the app's tsconfig
const appDir = resolve(dirname(fileURLToPath(import.meta.url)), '../../app');
const src = (file: string) => readFileSync(resolve(appDir, file), 'utf8');

describe('screens build loggedAt via src/lib/time', () => {
    it.each([
        ['register.tsx', 'pickedTimeToLoggedAt'],
        ['edit.tsx', 'editedTimeToLoggedAt'],
    ])('regression: %s uses %s, not a hand-built UTC-date string', (file, helper) => {
        const code = src(file);
        expect(code).toContain(`${helper}(`);
        expect(code).not.toMatch(/toISOString\(\)\.slice\(0,\s*10\)/);
        expect(code).not.toMatch(/T\$\{[^}]+\}:00`/);
    });
});
