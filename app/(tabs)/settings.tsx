import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../src/hooks/use-auth';

interface SettingsRowProps {
    icon: string;
    label: string;
    badge?: string;
    onPress?: () => void;
}

function SettingsRow({ icon, label, badge, onPress }: SettingsRowProps) {
    return (
        <TouchableOpacity
            onPress={onPress}
            className="flex-row items-center gap-4 bg-slate-900/60 px-4 py-3 rounded-xl mb-2 border border-primary/5"
            activeOpacity={0.7}
        >
            <View className="w-10 h-10 rounded-xl bg-primary/20 items-center justify-center shrink-0">
                <MaterialIcons name={icon as any} size={20} color="#2bee79" />
            </View>
            <Text className="text-slate-100 text-base font-medium flex-1"
                style={{ fontFamily: 'Lexend_500Medium' }}>{label}</Text>
            <View className="flex-row items-center gap-2">
                {badge && (
                    <Text className="text-primary text-xs font-medium" style={{ fontFamily: 'Lexend_500Medium' }}>{badge}</Text>
                )}
                <MaterialIcons name="chevron-right" size={20} color="#334155" />
            </View>
        </TouchableOpacity>
    );
}

export default function SettingsScreen() {
    const router = useRouter();
    const { user, logout } = useAuth();

    return (
        <SafeAreaView className="flex-1 bg-background-dark" edges={['top']}>
            {/* Header */}
            <View className="px-4 pt-4 pb-3 flex-row items-center border-b border-primary/10">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-10 h-10 items-center justify-center rounded-full"
                    activeOpacity={0.7}
                >
                    <MaterialIcons name="arrow-back-ios" size={20} color="#2bee79" />
                </TouchableOpacity>
                <Text className="flex-1 text-center pr-10 text-slate-100 text-lg font-bold"
                    style={{ fontFamily: 'Lexend_700Bold' }}>Settings</Text>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Profile */}
                <View className="mx-4 mt-6 p-6 rounded-2xl bg-slate-900/60 border border-primary/10 mb-6">
                    <View className="flex-row items-center gap-5">
                        <View className="w-20 h-20 rounded-full border-2 border-primary bg-primary/10 items-center justify-center overflow-hidden shrink-0">
                            {user?.avatarUrl ? (
                                <Image source={{ uri: user.avatarUrl }} className="w-full h-full" />
                            ) : (
                                <MaterialIcons name="person" size={36} color="#2bee79" />
                            )}
                        </View>
                        <View>
                            <Text className="text-slate-100 text-xl font-bold"
                                style={{ fontFamily: 'Lexend_700Bold' }}>{user?.name ?? 'You'}</Text>
                            <Text className="text-slate-400 text-sm" style={{ fontFamily: 'Lexend_400Regular' }}>
                                {user?.email ?? ''}
                            </Text>
                            <Text className="text-slate-500 text-xs mt-1" style={{ fontFamily: 'Lexend_400Regular' }}>
                                Frequency member
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Account */}
                <View className="px-4 mb-6">
                    <Text className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-3"
                        style={{ fontFamily: 'Lexend_700Bold' }}>Account</Text>
                    <SettingsRow icon="person" label="Personal Information" />
                    <SettingsRow icon="notifications" label="Notifications" />
                    <SettingsRow icon="tune" label="Manage My Actions" onPress={() => router.push('/manage-actions')} />
                </View>

                {/* Privacy */}
                <View className="px-4 mb-6">
                    <Text className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-3"
                        style={{ fontFamily: 'Lexend_700Bold' }}>Privacy & Security</Text>
                    <SettingsRow icon="lock" label="App Passcode" badge="Enabled" />
                    <SettingsRow icon="security" label="Data Privacy" />
                </View>

                {/* Support */}
                <View className="px-4 mb-6">
                    <Text className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-3"
                        style={{ fontFamily: 'Lexend_700Bold' }}>Support</Text>
                    <SettingsRow icon="help" label="Help Center" />
                    <SettingsRow icon="info" label="Version 1.0.0" />
                </View>

                {/* Logout */}
                <View className="px-4 mb-12">
                    <TouchableOpacity
                        onPress={logout}
                        className="bg-red-500/10 border border-red-500/20 rounded-xl py-4 items-center"
                        activeOpacity={0.8}
                    >
                        <Text className="text-red-400 font-bold" style={{ fontFamily: 'Lexend_700Bold' }}>
                            Log Out
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
