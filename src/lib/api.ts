// ─── Types ─────────────────────────────────────────────────────────────────────

export interface ApiUser {
    id: string;
    email: string;
    name: string;
    avatarUrl?: string | null;
}

export interface ApiAction {
    id: string;
    userId: string;
    name: string;
    icon: string;
    color: string;
    remindersEnabled: boolean;
    reminderTime: string | null;
    createdAt: string;
}

export interface ApiLog {
    log: {
        id: string;
        userId: string;
        actionId: string | null;
        loggedAt: string;
        note: string | null;
        createdAt: string;
    };
    action: ApiAction | null;
}

// ─── Base fetch wrapper ─────────────────────────────────────────────────────────

const BASE = (process.env.EXPO_PUBLIC_API_URL as string | undefined) ?? 'http://localhost:3000/api';

// Token getter is set by AuthProvider to avoid circular dependency
let getToken: (() => string | null) = () => null;
export function setTokenGetter(fn: () => string | null) {
    getToken = fn;
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = getToken();
    const url = `${BASE}${path}`;

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(url, { ...options, headers });

    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const msg = (body as { error?: string }).error ?? res.statusText;
        throw new ApiError(res.status, msg);
    }

    return res.json() as Promise<T>;
}

export class ApiError extends Error {
    status: number;
    constructor(status: number, message: string) {
        super(message);
        this.status = status;
        this.name = 'ApiError';
    }
}

// ─── Auth ───────────────────────────────────────────────────────────────────────

export const authApi = {
    register: (email: string, password: string, name: string) =>
        apiFetch<{ token: string; user: ApiUser }>('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, name }),
        }),

    login: (email: string, password: string) =>
        apiFetch<{ token: string; user: ApiUser }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        }),

    getMe: () => apiFetch<{ user: ApiUser }>('/auth/me'),
};

// ─── Actions ────────────────────────────────────────────────────────────────────

export const actionsApi = {
    list: () => apiFetch<ApiAction[]>('/actions'),

    create: (data: {
        name: string;
        icon?: string;
        color?: string;
        remindersEnabled?: boolean;
        reminderTime?: string;
    }) =>
        apiFetch<ApiAction>('/actions', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    update: (
        id: string,
        data: Partial<{
            name: string;
            icon: string;
            color: string;
            remindersEnabled: boolean;
            reminderTime: string;
        }>
    ) =>
        apiFetch<ApiAction>(`/actions/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    remove: (id: string) =>
        apiFetch<{ success: boolean }>(`/actions/${id}`, { method: 'DELETE' }),
};

// ─── Logs ───────────────────────────────────────────────────────────────────────

export const logsApi = {
    list: (params?: { date?: string; last24h?: boolean }) => {
        const qs = new URLSearchParams();
        if (params?.date) qs.set('date', params.date);
        if (params?.last24h) qs.set('last24h', 'true');
        return apiFetch<ApiLog[]>(`/logs${qs.toString() ? '?' + qs.toString() : ''}`);
    },

    get: (id: string) => apiFetch<ApiLog>(`/logs/${id}`),

    stats: () =>
        apiFetch<{ totalToday: number; dateInfo: string }>('/logs/stats'),

    create: (data: { actionId?: string; loggedAt: string; note?: string }) =>
        apiFetch<ApiLog>('/logs', { method: 'POST', body: JSON.stringify(data) }),

    update: (id: string, data: { loggedAt?: string; note?: string }) =>
        apiFetch<ApiLog>(`/logs/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    remove: (id: string) =>
        apiFetch<{ success: boolean }>(`/logs/${id}`, { method: 'DELETE' }),
};
