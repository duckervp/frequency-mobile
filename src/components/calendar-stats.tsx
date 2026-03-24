import React from 'react';
import { View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface CalendarStatsProps {
    totalThisMonth: number;
    currentStreak: number;
    loading?: boolean;
}

export default function CalendarStats({ totalThisMonth, currentStreak, loading }: CalendarStatsProps) {
    return (
        <View className="flex-row gap-3">
            {/* Total this month */}
            <View className="flex-1 bg-slate-800/40 rounded-2xl p-4 border border-primary/10">
                {loading ? (
                    <View className="h-8 w-16 bg-slate-700 rounded mb-1" />
                ) : (
                    <Text className="text-primary text-3xl font-bold" style={{ fontFamily: 'Lexend_700Bold' }}>
                        {totalThisMonth}
                    </Text>
                )}
                <Text className="text-slate-400 text-xs mt-1" style={{ fontFamily: 'Lexend_400Regular' }}>
                    This month
                </Text>
            </View>

            {/* Current streak */}
            <View className="flex-1 bg-slate-800/40 rounded-2xl p-4 border border-primary/10">
                <View className="flex-row items-center gap-1">
                    {loading ? (
                        <View className="h-8 w-12 bg-slate-700 rounded" />
                    ) : (
                        <>
                            <Text className="text-primary text-3xl font-bold" style={{ fontFamily: 'Lexend_700Bold' }}>
                                {currentStreak}
                            </Text>
                            <MaterialIcons name="local-fire-department" size={22} color="#2bee79" />
                        </>
                    )}
                </View>
                <Text className="text-slate-400 text-xs mt-1" style={{ fontFamily: 'Lexend_400Regular' }}>
                    Day streak
                </Text>
            </View>
        </View>
    );
}
