// Builds loggedAt values from the "HH:MM" (24h) picked in the time picker.
// All day logic uses the device's local timezone; values sent to the API are ISO instants (UTC, with Z).
// Mirrors the web app's src/lib/time.ts (pickedTimeToISO / withLocalTime).

function withLocalTime(base: Date, hhmm: string): Date {
    const [h, m] = hhmm.split(':').map(Number);
    const d = new Date(base);
    d.setHours(h, m, 0, 0);
    return d;
}

/**
 * Register: today's local date at the picked time. If that is later than now
 * (e.g. 23:30 picked at 00:15), the user means the previous day — never log in the future.
 */
export function pickedTimeToLoggedAt(hhmm: string, now = new Date()): string {
    const d = withLocalTime(now, hhmm);
    if (d > now) d.setDate(d.getDate() - 1);
    return d.toISOString();
}

/**
 * Edit: same local date as the original log, at the picked time.
 * Legacy offset-less values written by old builds ("2026-10-01T09:00:00") parse as local wall time,
 * so saving also repairs them to a UTC instant.
 */
export function editedTimeToLoggedAt(originalLoggedAt: string, hhmm: string): string {
    return withLocalTime(new Date(originalLoggedAt), hhmm).toISOString();
}
