import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { useAuth } from '../../src/hooks/use-auth';
import { MaterialIcons } from '@expo/vector-icons';

WebBrowser.maybeCompleteAuthSession();

type Mode = 'choose' | 'email-login' | 'email-register';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api';

export default function LoginScreen() {
    const { login, register, handleGoogleToken, isLoading } = useAuth();
    const [mode, setMode] = useState<Mode>('choose');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');

    // ── Email submit ──────────────────────────────────────────────────────────
    const handleEmailSubmit = async () => {
        setError('');
        try {
            if (mode === 'email-login') {
                await login(email, password);
            } else {
                await register(email, password, name);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        }
    };

    // ── Google OAuth ──────────────────────────────────────────────────────────
    const handleGoogle = async () => {
        setError('');
        try {
            // Open backend Google OAuth flow in a web browser
            const googleUrl = `${API_URL}/auth/google`;
            const redirectUrl = AuthSession.makeRedirectUri({ scheme: 'frequency' });

            const result = await WebBrowser.openAuthSessionAsync(googleUrl, redirectUrl);
            if (result.type === 'success' && result.url) {
                // Backend redirects to: frequency://dashboard#token=<jwt>
                const hash = result.url.split('#')[1] ?? '';
                const token = new URLSearchParams(hash).get('token');
                if (token) {
                    await handleGoogleToken(token);
                } else {
                    setError('Google login failed — no token received');
                }
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Google login failed');
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-background-dark">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyboardShouldPersistTaps="handled"
                >
                    <View className="flex-1 px-8 justify-center items-center">
                        {/* Brand */}
                        <View className="items-center mb-12 mt-16">
                            <View className="w-16 h-16 bg-primary/20 rounded-2xl items-center justify-center mb-6">
                                <MaterialIcons name="analytics" size={36} color="#2bee79" />
                            </View>
                            <Text className="text-slate-100 text-4xl font-bold tracking-tight mb-3"
                                style={{ fontFamily: 'Lexend_700Bold' }}>
                                Frequency
                            </Text>
                            <Text className="text-slate-400 text-base text-center leading-relaxed"
                                style={{ fontFamily: 'Lexend_400Regular' }}>
                                Your private space for personal{'\n'}habits and action tracking.
                            </Text>
                        </View>

                        {/* Buttons / Form */}
                        <View className="w-full gap-4">
                            {mode === 'choose' ? (
                                <>
                                    {/* Google */}
                                    <TouchableOpacity
                                        onPress={handleGoogle}
                                        className="flex-row items-center justify-center h-14 rounded-xl bg-slate-100 gap-3 shadow-lg"
                                        activeOpacity={0.85}
                                    >
                                        <MaterialIcons name="g-translate" size={22} color="#0f172a" />
                                        <Text className="text-slate-900 font-bold text-base" style={{ fontFamily: 'Lexend_700Bold' }}>
                                            Continue with Google
                                        </Text>
                                    </TouchableOpacity>

                                    {/* Email */}
                                    <TouchableOpacity
                                        onPress={() => setMode('email-login')}
                                        className="flex-row items-center justify-center h-14 rounded-xl bg-primary gap-3"
                                        activeOpacity={0.85}
                                    >
                                        <MaterialIcons name="email" size={20} color="#102217" />
                                        <Text className="text-background-dark font-bold text-base" style={{ fontFamily: 'Lexend_700Bold' }}>
                                            Continue with Email
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={() => setMode('email-register')}
                                        className="items-center py-2"
                                        activeOpacity={0.7}
                                    >
                                        <Text className="text-slate-400 text-sm font-semibold" style={{ fontFamily: 'Lexend_500Medium' }}>
                                            Create new account
                                        </Text>
                                    </TouchableOpacity>
                                </>
                            ) : (
                                <>
                                    <Text className="text-slate-100 text-lg font-bold text-center" style={{ fontFamily: 'Lexend_700Bold' }}>
                                        {mode === 'email-login' ? 'Sign In' : 'Create Account'}
                                    </Text>

                                    {mode === 'email-register' && (
                                        <TextInput
                                            placeholder="Your name"
                                            placeholderTextColor="#64748b"
                                            value={name}
                                            onChangeText={setName}
                                            className="h-12 px-4 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 text-sm"
                                            style={{ fontFamily: 'Lexend_400Regular' }}
                                        />
                                    )}

                                    <TextInput
                                        placeholder="Email address"
                                        placeholderTextColor="#64748b"
                                        value={email}
                                        onChangeText={setEmail}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        className="h-12 px-4 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 text-sm"
                                        style={{ fontFamily: 'Lexend_400Regular' }}
                                    />

                                    <TextInput
                                        placeholder="Password"
                                        placeholderTextColor="#64748b"
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry
                                        className="h-12 px-4 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 text-sm"
                                        style={{ fontFamily: 'Lexend_400Regular' }}
                                    />

                                    {error !== '' && (
                                        <Text className="text-red-400 text-sm text-center" style={{ fontFamily: 'Lexend_400Regular' }}>
                                            {error}
                                        </Text>
                                    )}

                                    <TouchableOpacity
                                        onPress={handleEmailSubmit}
                                        disabled={isLoading}
                                        className="flex-row items-center justify-center h-14 rounded-xl bg-primary opacity-100 disabled:opacity-60"
                                        activeOpacity={0.85}
                                    >
                                        {isLoading ? (
                                            <ActivityIndicator color="#102217" />
                                        ) : (
                                            <Text className="text-background-dark font-bold text-base" style={{ fontFamily: 'Lexend_700Bold' }}>
                                                {mode === 'email-login' ? 'Sign In' : 'Create Account'}
                                            </Text>
                                        )}
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={() => { setMode(mode === 'email-login' ? 'email-register' : 'email-login'); setError(''); }}
                                        className="items-center py-1"
                                        activeOpacity={0.7}
                                    >
                                        <Text className="text-slate-400 text-sm" style={{ fontFamily: 'Lexend_400Regular' }}>
                                            {mode === 'email-login' ? "Don't have an account? Create one" : 'Already have an account? Sign In'}
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={() => { setMode('choose'); setError(''); }}
                                        className="items-center py-1"
                                        activeOpacity={0.7}
                                    >
                                        <Text className="text-slate-500 text-xs" style={{ fontFamily: 'Lexend_400Regular' }}>
                                            ← Back to options
                                        </Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>

                        {/* Footer */}
                        <View className="mt-auto pt-12 pb-8">
                            <Text className="text-slate-600 text-xs text-center leading-relaxed" style={{ fontFamily: 'Lexend_400Regular' }}>
                                By continuing, you agree to Frequency's{'\n'}Terms of Service and Privacy Policy.
                            </Text>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
