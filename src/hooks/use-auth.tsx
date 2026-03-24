import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    type ReactNode,
} from 'react';
import { useRouter, useSegments } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { authApi, type ApiUser, setTokenGetter } from '../lib/api';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface AuthContextValue {
    user: ApiUser | null;
    token: string | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, name: string) => Promise<void>;
    logout: () => void;
    /** Called by Google OAuth flow once the token is obtained from deep link */
    handleGoogleToken: (token: string) => Promise<void>;
}

// ─── Storage keys ───────────────────────────────────────────────────────────────

const TOKEN_KEY = 'freq_token';
const USER_KEY = 'freq_user';

// ─── Context ────────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── AuthProvider ───────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
    const router = useRouter();
    const segments = useSegments();

    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<ApiUser | null>(null);
    const [isLoading, setIsLoading] = useState(true); // start true — loading from secure store

    // ── Bootstrap: load token + user from SecureStore on mount ─────────────────
    useEffect(() => {
        async function bootstrap() {
            try {
                const storedToken = await SecureStore.getItemAsync(TOKEN_KEY);
                const storedUser = await SecureStore.getItemAsync(USER_KEY);
                if (storedToken) {
                    setToken(storedToken);
                    // Register token getter so apiFetch can access it
                    setTokenGetter(() => storedToken);
                }
                if (storedUser) {
                    setUser(JSON.parse(storedUser) as ApiUser);
                }
            } catch (e) {
                console.warn('[AUTH] Failed to load stored credentials', e);
            } finally {
                setIsLoading(false);
            }
        }
        bootstrap();
    }, []);

    // ── Keep token getter in sync whenever token changes ───────────────────────
    useEffect(() => {
        setTokenGetter(() => token);
    }, [token]);

    // ── Route guard: redirect to login if no token, to dashboard if logged in ──
    useEffect(() => {
        if (isLoading) return;
        const inAuthGroup = segments[0] === '(auth)';
        if (!token && !inAuthGroup) {
            router.replace('/(auth)/login');
        } else if (token && inAuthGroup) {
            router.replace('/(tabs)/dashboard');
        }
    }, [token, segments, isLoading, router]);

    // ── Persist helper ─────────────────────────────────────────────────────────
    const persist = useCallback(async (t: string, u: ApiUser) => {
        await SecureStore.setItemAsync(TOKEN_KEY, t);
        await SecureStore.setItemAsync(USER_KEY, JSON.stringify(u));
        setToken(t);
        setUser(u);
    }, []);

    // ── Logout ─────────────────────────────────────────────────────────────────
    const logout = useCallback(async () => {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        await SecureStore.deleteItemAsync(USER_KEY);
        setToken(null);
        setUser(null);
        router.replace('/(auth)/login');
    }, [router]);

    // ── Email Login ────────────────────────────────────────────────────────────
    const login = useCallback(
        async (email: string, password: string) => {
            setIsLoading(true);
            try {
                const data = await authApi.login(email, password);
                await persist(data.token, data.user);
            } finally {
                setIsLoading(false);
            }
        },
        [persist]
    );

    // ── Email Register ─────────────────────────────────────────────────────────
    const register = useCallback(
        async (email: string, password: string, name: string) => {
            setIsLoading(true);
            try {
                const data = await authApi.register(email, password, name);
                await persist(data.token, data.user);
            } finally {
                setIsLoading(false);
            }
        },
        [persist]
    );

    // ── Google OAuth token callback (called from login screen) ─────────────────
    const handleGoogleToken = useCallback(
        async (t: string) => {
            setIsLoading(true);
            try {
                // Token is already issued by backend — just fetch the user profile
                setTokenGetter(() => t);
                const data = await authApi.getMe();
                await persist(t, data.user);
            } catch (e) {
                console.error('[AUTH] Failed to fetch profile after Google OAuth', e);
                throw e;
            } finally {
                setIsLoading(false);
            }
        },
        [persist]
    );

    return (
        <AuthContext.Provider
            value={{ user, token, isLoading, login, register, logout, handleGoogleToken }}
        >
            {children}
        </AuthContext.Provider>
    );
}

// ─── Hooks ──────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
    return ctx;
}
