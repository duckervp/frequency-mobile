import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import Header from '../../src/components/header';
import CalendarSelect from '../../src/components/calendar-select';
import CalendarGrid from '../../src/components/calendar-grid';
import CalendarStats from '../../src/components/calendar-stats';
import ActionItem from '../../src/components/action-item';
import { logsApi, actionsApi, type ApiLog, type ApiAction } from '../../src/lib/api';

function toDateStr(year: number, month: number, day: number) {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
}

function computeStreak(logsByDay: Map<string, number>): number {
    let streak = 0;
    const cursor = new Date();
    cursor.setHours(0, 0, 0, 0);
    while (true) {
        const key = cursor.toISOString().slice(0, 10);
        if (logsByDay.has(key) && logsByDay.get(key)! > 0) {
            streak++;
            cursor.setDate(cursor.getDate() - 1);
        } else break;
    }
    return streak;
}

export default function CalendarScreen() {
    const router = useRouter();
    const today = new Date();

    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth());
    const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate());
    const [actions, setActions] = useState<ApiAction[]>([]);
    const [filterActionId, setFilterActionId] = useState<string | null>(null);
    const [actionsLoading, setActionsLoading] = useState(true);
    const [monthLogs, setMonthLogs] = useState<ApiLog[]>([]);
    const [monthLoading, setMonthLoading] = useState(true);
    const [dayLogs, setDayLogs] = useState<ApiLog[]>([]);
    const [dayLoading, setDayLoading] = useState(false);

    useEffect(() => {
        actionsApi.list().then(setActions).finally(() => setActionsLoading(false));
    }, []);

    useEffect(() => {
        setMonthLoading(true);
        logsApi.list().then(setMonthLogs).finally(() => setMonthLoading(false));
    }, []);

    const loadDayLogs = useCallback(async (d: number) => {
        setDayLoading(true);
        try {
            const rows = await logsApi.list({ date: toDateStr(year, month, d) });
            setDayLogs(rows);
        } finally { setDayLoading(false); }
    }, [year, month]);

    useEffect(() => {
        if (selectedDay !== null) loadDayLogs(selectedDay);
    }, [selectedDay, loadDayLogs]);

    const activeDays = useMemo(() => {
        const set = new Set<number>();
        monthLogs.forEach(entry => {
            const d = new Date(entry.log.loggedAt);
            if (d.getFullYear() !== year || d.getMonth() !== month) return;
            if (filterActionId && entry.log.actionId !== filterActionId) return;
            set.add(d.getDate());
        });
        return set;
    }, [monthLogs, year, month, filterActionId]);

    const totalThisMonth = useMemo(() =>
        monthLogs.filter(entry => {
            const d = new Date(entry.log.loggedAt);
            if (d.getFullYear() !== year || d.getMonth() !== month) return false;
            if (filterActionId && entry.log.actionId !== filterActionId) return false;
            return true;
        }).length, [monthLogs, year, month, filterActionId]);

    const currentStreak = useMemo(() => {
        const byDay = new Map<string, number>();
        monthLogs.forEach(entry => {
            const key = entry.log.loggedAt.slice(0, 10);
            byDay.set(key, (byDay.get(key) ?? 0) + 1);
        });
        return computeStreak(byDay);
    }, [monthLogs]);

    const filteredDayLogs = useMemo(() =>
        filterActionId ? dayLogs.filter(e => e.log.actionId === filterActionId) : dayLogs,
        [dayLogs, filterActionId]);

    const selectedDateLabel = selectedDay !== null
        ? new Date(year, month, selectedDay).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
        : null;

    const handlePrevMonth = () => {
        setSelectedDay(null);
        if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1);
    };
    const handleNextMonth = () => {
        setSelectedDay(null);
        if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1);
    };

    return (
        <SafeAreaView className="flex-1 bg-background-dark" edges={['top']}>
            <Header title="Frequency Tracker" />
            <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}
                contentContainerStyle={{ gap: 16, paddingBottom: 32 }}>

                <CalendarSelect
                    actions={actions}
                    selectedActionId={filterActionId}
                    onChange={setFilterActionId}
                    loading={actionsLoading}
                />

                <CalendarGrid
                    year={year} month={month}
                    activeDays={activeDays} selectedDay={selectedDay}
                    onDaySelect={d => setSelectedDay(d === selectedDay ? null : d)}
                    onPrevMonth={handlePrevMonth} onNextMonth={handleNextMonth}
                />

                <CalendarStats totalThisMonth={totalThisMonth} currentStreak={currentStreak} loading={monthLoading} />

                {/* Day detail */}
                {selectedDay !== null && (
                    <View className="gap-3">
                        <View className="flex-row items-center justify-between">
                            <Text className="text-slate-100 text-base font-bold" style={{ fontFamily: 'Lexend_700Bold' }}>
                                {selectedDateLabel}
                            </Text>
                            {filteredDayLogs.length > 0 && (
                                <View className="px-2 py-1 rounded-full bg-primary/10">
                                    <Text className="text-primary text-xs font-bold" style={{ fontFamily: 'Lexend_700Bold' }}>
                                        {filteredDayLogs.length} {filteredDayLogs.length === 1 ? 'log' : 'logs'}
                                    </Text>
                                </View>
                            )}
                        </View>

                        {dayLoading ? (
                            <View className="gap-3">
                                {[0, 1].map(i => (
                                    <View key={i} className="flex-row items-center gap-3 p-3 rounded-lg bg-slate-800/30">
                                        <View className="w-10 h-10 rounded-full bg-slate-700" />
                                        <View className="flex-1 gap-2">
                                            <View className="h-4 w-32 bg-slate-700 rounded" />
                                            <View className="h-3 w-16 bg-slate-700 rounded" />
                                        </View>
                                    </View>
                                ))}
                            </View>
                        ) : filteredDayLogs.length === 0 ? (
                            <View className="items-center py-8">
                                <MaterialIcons name="event-busy" size={32} color="#64748b" />
                                <Text className="text-slate-400 text-sm mt-2" style={{ fontFamily: 'Lexend_400Regular' }}>
                                    No logs recorded for this day.
                                </Text>
                            </View>
                        ) : (
                            <View>
                                {filteredDayLogs.map(entry => (
                                    <ActionItem
                                        key={entry.log.id}
                                        title={entry.action?.name ?? 'Quick Log'}
                                        time={new Date(entry.log.loggedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                        note={entry.log.note ?? ''}
                                        icon={entry.action?.icon ?? 'task-alt'}
                                        onEdit={() => router.push(`/edit?logId=${entry.log.id}`)}
                                        onDelete={async () => {
                                            await logsApi.remove(entry.log.id);
                                            setDayLogs(prev => prev.filter(l => l.log.id !== entry.log.id));
                                            setMonthLogs(prev => prev.filter(l => l.log.id !== entry.log.id));
                                        }}
                                    />
                                ))}
                            </View>
                        )}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
