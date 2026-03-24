import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import Header from '../../src/components/header';
import SummaryCard from '../../src/components/summary-card';
import ActionItem from '../../src/components/action-item';
import { logsApi, type ApiLog } from '../../src/lib/api';

function buildDatePills(count = 7) {
    const pills: { label: string; dateStr: string }[] = [];
    for (let i = 0; i < count; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().slice(0, 10);
        const label = i === 0 ? 'Today' : i === 1 ? 'Yesterday'
            : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        pills.push({ label, dateStr });
    }
    return pills;
}

const DATE_PILLS = buildDatePills(7);

export default function LogScreen() {
    const router = useRouter();
    const [selectedDateStr, setSelectedDateStr] = useState(DATE_PILLS[0].dateStr);
    const [logs, setLogs] = useState<ApiLog[]>([]);
    const [stats, setStats] = useState({ totalToday: 0, dateInfo: 'Today' });
    const [loading, setLoading] = useState(true);

    const loadLogs = useCallback(async (dateStr: string) => {
        setLoading(true);
        try {
            const [logsData, statsData] = await Promise.all([
                logsApi.list({ date: dateStr }),
                logsApi.stats(),
            ]);
            setLogs(logsData);
            setStats(statsData);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadLogs(selectedDateStr); }, [selectedDateStr, loadLogs]);

    const selectedPill = DATE_PILLS.find(p => p.dateStr === selectedDateStr);

    return (
        <SafeAreaView className="flex-1 bg-background-dark" edges={['top']}>
            <Header title={stats.dateInfo} />
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                <SummaryCard totalActions={stats.totalToday} loading={loading} />

                {/* Date pills */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, gap: 8 }}
                >
                    {DATE_PILLS.map(pill => (
                        <TouchableOpacity
                            key={pill.dateStr}
                            onPress={() => setSelectedDateStr(pill.dateStr)}
                            className={`px-4 py-2 rounded-full ${selectedDateStr === pill.dateStr
                                ? 'bg-primary' : 'bg-slate-800/60'}`}
                            activeOpacity={0.7}
                        >
                            <Text
                                className={`text-sm font-semibold ${selectedDateStr === pill.dateStr ? 'text-background-dark' : 'text-slate-400'}`}
                                style={{ fontFamily: 'Lexend_500Medium' }}
                            >
                                {pill.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Log list header */}
                <View className="flex-row items-center justify-between px-4 pb-3">
                    <Text className="text-slate-100 text-lg font-bold" style={{ fontFamily: 'Lexend_700Bold' }}>
                        Action Log
                    </Text>
                    <View className="px-2 py-1 rounded-full bg-primary/10">
                        <Text className="text-primary text-xs font-bold" style={{ fontFamily: 'Lexend_700Bold' }}>
                            {selectedPill?.label ?? selectedDateStr}
                        </Text>
                    </View>
                </View>

                {loading ? (
                    <View className="gap-3 px-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <View key={i} className="flex-row items-center gap-3 p-3 rounded-lg bg-slate-800/30">
                                <View className="w-10 h-10 rounded-full bg-slate-700" />
                                <View className="flex-1 gap-2">
                                    <View className="h-4 w-32 bg-slate-700 rounded" />
                                    <View className="h-3 w-16 bg-slate-700 rounded" />
                                </View>
                            </View>
                        ))}
                    </View>
                ) : logs.length === 0 ? (
                    <View className="items-center py-10">
                        <MaterialIcons name="history" size={40} color="#64748b" />
                        <Text className="text-slate-400 text-sm mt-2 text-center px-8"
                            style={{ fontFamily: 'Lexend_400Regular' }}>
                            {selectedDateStr === DATE_PILLS[0].dateStr
                                ? 'No actions logged today yet.'
                                : 'No actions logged on this day.'}
                        </Text>
                    </View>
                ) : (
                    <View className="pb-8">
                        {logs.map(entry => (
                            <ActionItem
                                key={entry.log.id}
                                title={entry.action?.name ?? 'Quick Log'}
                                time={new Date(entry.log.loggedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                note={entry.log.note ?? ''}
                                icon={entry.action?.icon ?? 'task-alt'}
                                onEdit={() => router.push(`/edit?logId=${entry.log.id}`)}
                                onDelete={async () => {
                                    await logsApi.remove(entry.log.id);
                                    setLogs(prev => prev.filter(l => l.log.id !== entry.log.id));
                                }}
                            />
                        ))}
                    </View>
                )}
            </ScrollView>

            {/* FAB */}
            <TouchableOpacity
                onPress={() => router.push('/register')}
                className="absolute bottom-24 right-6 w-14 h-14 rounded-full bg-primary items-center justify-center shadow-lg"
                activeOpacity={0.8}
            >
                <MaterialIcons name="add" size={28} color="#102217" />
            </TouchableOpacity>
        </SafeAreaView>
    );
}
