// Runs with TZ=Asia/Ho_Chi_Minh (see vitest.config.ts) so local ≠ UTC.
import { describe, expect, it } from 'vitest';
import { editedTimeToLoggedAt, pickedTimeToLoggedAt } from './time';

const at = (iso: string) => new Date(iso);

describe('pickedTimeToLoggedAt (Register)', () => {
    it('regression: early-morning log stays on the local day (was the previous UTC day)', () => {
        // Nov 3, 06:30 local = Nov 2, 23:30 UTC
        expect(pickedTimeToLoggedAt('06:30', at('2026-11-02T23:30:00.000Z'))).toBe('2026-11-02T23:30:00.000Z');
    });

    it('regression: sends an ISO instant with Z, not local wall time without an offset', () => {
        expect(pickedTimeToLoggedAt('09:00', at('2026-11-03T03:00:00.000Z'))).toMatch(/Z$/);
    });

    it('a time later than now means the previous day, never the future', () => {
        // Nov 4, 00:15 local; picked 23:30 = last night
        expect(pickedTimeToLoggedAt('23:30', at('2026-11-03T17:15:00.000Z'))).toBe('2026-11-03T16:30:00.000Z');
    });

    it('the current minute stays today', () => {
        expect(pickedTimeToLoggedAt('10:00', at('2026-11-03T03:00:00.000Z'))).toBe('2026-11-03T03:00:00.000Z');
    });
});

describe('editedTimeToLoggedAt (Edit)', () => {
    it('regression: keeps the log date instead of moving it to today', () => {
        // Oct 1, 09:00 local; saved on Nov 3 without changing the time
        expect(editedTimeToLoggedAt('2026-10-01T02:00:00.000Z', '09:00')).toBe(
            '2026-10-01T02:00:00.000Z'
        );
    });

    it('changes only the time of day, on the local date of the log', () => {
        // Nov 3, 06:00 local (= Nov 2 UTC) → 07:30 local the same local day
        expect(editedTimeToLoggedAt('2026-11-02T23:00:00.000Z', '07:30')).toBe(
            '2026-11-03T00:30:00.000Z'
        );
    });

    it('stays on the log’s local day at both ends of the day (local date ≠ UTC date)', () => {
        // Nov 3, 06:00 local = Nov 2, 23:00 UTC
        expect(editedTimeToLoggedAt('2026-11-02T23:00:00.000Z', '00:00')).toBe('2026-11-02T17:00:00.000Z'); // Nov 3 00:00 local
        expect(editedTimeToLoggedAt('2026-11-02T23:00:00.000Z', '23:59')).toBe('2026-11-03T16:59:00.000Z'); // Nov 3 23:59 local
    });

    it('reads legacy offset-less values (old mobile builds) as local wall time and repairs them to UTC', () => {
        expect(editedTimeToLoggedAt('2026-10-01T09:00:00', '09:15')).toBe(
            '2026-10-01T02:15:00.000Z'
        );
    });
});
