import React, { useState, useEffect } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity,
    TextInput, Image, ActivityIndicator, Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../src/hooks/use-auth';
import { actionsApi, logsApi, type ApiAction, type ApiLog } from '../../src/lib/api';
import { DEFAULT_ACTIONS } from '../../src/data/mock-data';

export default function DashboardScreen() {
    const router = useRouter();
    const { user } = useAuth();

    const [actions, setActions] = useState<ApiAction[]>([]);
    const [logs, setLogs] = useState<ApiLog[]>([]);
    const [search, setSearch] = useState('');
    const [actionsLoading, setActionsLoading] = useState(true);
    const [logsLoading, setLogsLoading] = useState(true);

    useEffect(() => {
        actionsApi.list()
            .then(setActions)
            .finally(() => setActionsLoading(false));
        logsApi.list({ last24h: true })
            .then(setLogs)
            .finally(() => setLogsLoading(false));
    }, []);

    const quickActions = !actionsLoading
        ? (actions.length > 0 ? actions.slice(0, 5) : DEFAULT_ACTIONS)
        : null;

    const filteredLogs = logs.filter(entry => {
        const q = search.toLowerCase();
        if (!q) return true;
        return (
            entry.action?.name.toLowerCase().includes(q) ||
            (entry.log.note ?? '').toLowerCase().includes(q)
        );
    });

    return (
        <SafeAreaView className="flex-1 bg-background-dark" edges={['top']}>
            {/* Header */}
            <View className="px-4 pt-4 pb-3 flex-row items-center justify-between border-b border-primary/10">
                <TouchableOpacity
                    onPress={() => router.push('/settings')}
                    className="w-10 h-10 rounded-full border-2 border-primary/20 overflow-hidden items-center justify-center bg-primary/10"
                    activeOpacity={0.7}
                >
                    {user?.avatarUrl ? (
                        <Image source={{ uri: user.avatarUrl }} className="w-full h-full" />
                    ) : (
                        <MaterialIcons name="person" size={20} color="#2bee79" />
                    )}
                </TouchableOpacity>
                <Text className="text-slate-100 text-lg font-bold flex-1 text-center"
                    style={{ fontFamily: 'Lexend_700Bold' }}>Dashboard</Text>
                <TouchableOpacity onPress={() => router.push('/settings')} className="w-10 items-end" activeOpacity={0.7}>
                    <MaterialIcons name="settings" size={22} color="#94a3b8" />
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Search */}
                <View className="px-4 mt-6 mb-6">
                    <Text className="text-slate-100 text-2xl font-bold mb-4"
                        style={{ fontFamily: 'Lexend_700Bold' }}>What are you doing now?</Text>
                    <View className="relative">
                        <View className="absolute left-3 top-0 bottom-0 justify-center z-10">
                            <MaterialIcons name="search" size={20} color="#2bee79" />
                        </View>
                        <TextInput
                            className="bg-slate-800/50 rounded-xl px-4 py-4 pl-10 text-slate-100 text-sm"
                            style={{ fontFamily: 'Lexend_400Regular' }}
                            placeholder="Search actions or habits..."
                            placeholderTextColor="#64748b"
                            value={search}
                            onChangeText={setSearch}
                        />
                    </View>
                </View>

                {/* Quick Actions */}
                <View className="px-4 mb-8">
                    <View className="flex-row items-center justify-between mb-4">
                        <Text className="text-slate-100 text-lg font-semibold"
                            style={{ fontFamily: 'Lexend_500Medium' }}>Quick Actions</Text>
                        <TouchableOpacity onPress={() => router.push('/manage-actions')} activeOpacity={0.7}>
                            <Text className="text-primary text-sm font-medium" style={{ fontFamily: 'Lexend_500Medium' }}>
                                Edit Grid
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* 2-column grid */}
                    <View className="flex-row flex-wrap gap-4">
                        {actionsLoading ? (
                            Array.from({ length: 4 }).map((_, i) => (
                                <View key={i} className="w-[47%] p-4 rounded-xl bg-slate-800/50 h-20" />
                            ))
                        ) : (
                            <>
                                {quickActions?.map(action => {
                                    const isReal = !action.id.startsWith('__default_');
                                    return (
                                        <Pressable
                                            key={action.id}
                                            onPress={() => router.push(isReal ? `/register?actionId=${action.id}` : '/register')}
                                            className="w-[47%] p-4 rounded-xl bg-slate-800/50 active:opacity-70"
                                        >
                                            <View className="w-10 h-10 rounded-lg bg-primary/20 items-center justify-center mb-3">
                                                <MaterialIcons name={(action.icon as any) || 'star'} size={22} color="#2bee79" />
                                            </View>
                                            <Text className="text-slate-100 text-sm font-medium"
                                                style={{ fontFamily: 'Lexend_500Medium' }} numberOfLines={1}>
                                                {action.name}
                                            </Text>
                                        </Pressable>
                                    );
                                })}
                                {/* New Action button */}
                                <Pressable
                                    onPress={() => router.push('/create')}
                                    className="w-[47%] p-4 rounded-xl border-2 border-dashed border-slate-700 items-center justify-center active:opacity-70 h-20"
                                >
                                    <View className="w-10 h-10 rounded-full bg-primary items-center justify-center mb-2">
                                        <MaterialIcons name="add" size={22} color="#102217" />
                                    </View>
                                    <Text className="text-primary text-sm font-medium" style={{ fontFamily: 'Lexend_500Medium' }}>
                                        New Action
                                    </Text>
                                </Pressable>
                            </>
                        )}
                    </View>
                </View>

                {/* Last 24 Hours */}
                <View className="px-4 mb-8">
                    <Text className="text-slate-100 text-lg font-semibold mb-4"
                        style={{ fontFamily: 'Lexend_500Medium' }}>Last 24 Hours</Text>

                    {logsLoading ? (
                        <View className="gap-3">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <View key={i} className="flex-row items-center gap-3 p-3 rounded-lg bg-slate-800/30">
                                    <View className="w-10 h-10 rounded-full bg-slate-700" />
                                    <View className="flex-1 gap-2">
                                        <View className="h-4 w-32 bg-slate-700 rounded" />
                                        <View className="h-3 w-16 bg-slate-700 rounded" />
                                    </View>
                                </View>
                            ))}
                        </View>
                    ) : filteredLogs.length === 0 ? (
                        <View className="items-center py-10">
                            <MaterialIcons name="history" size={40} color="#64748b" />
                            <Text className="text-slate-400 text-sm mt-2 text-center"
                                style={{ fontFamily: 'Lexend_400Regular' }}>
                                No logs yet today. Tap a quick action to get started!
                            </Text>
                        </View>
                    ) : (
                        <View className="gap-2">
                            {filteredLogs.map(entry => (
                                <TouchableOpacity
                                    key={entry.log.id}
                                    onPress={() => router.push(`/edit?logId=${entry.log.id}`)}
                                    className="flex-row items-center gap-3 p-3 rounded-lg bg-slate-800/30"
                                    activeOpacity={0.7}
                                >
                                    <MaterialIcons name={(entry.action?.icon as any) ?? 'task-alt'} size={20} color="#2bee79" />
                                    <View className="flex-1">
                                        <Text className="text-slate-100 text-sm font-medium"
                                            style={{ fontFamily: 'Lexend_500Medium' }}>
                                            {entry.action?.name ?? 'Quick Log'}
                                        </Text>
                                        <Text className="text-slate-500 text-xs" style={{ fontFamily: 'Lexend_400Regular' }}>
                                            {new Date(entry.log.loggedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                        </Text>
                                    </View>
                                    {entry.log.note && (
                                        <Text className="text-slate-400 text-xs max-w-20" numberOfLines={1}
                                            style={{ fontFamily: 'Lexend_400Regular' }}>
                                            {entry.log.note}
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
