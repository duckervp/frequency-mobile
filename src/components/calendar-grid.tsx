import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface CalendarGridProps {
    year: number;
    month: number;
    activeDays: Set<number>;
    selectedDay: number | null;
    onDaySelect: (day: number) => void;
    onPrevMonth: () => void;
    onNextMonth: () => void;
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarGrid({
    year, month, activeDays, selectedDay, onDaySelect, onPrevMonth, onNextMonth
}: CalendarGridProps) {
    const today = new Date();
    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth();
    const todayDate = today.getDate();

    // Days in month and starting weekday
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startDay = new Date(year, month, 1).getDay(); // 0=Sun

    // Build grid cells (nulls = empty leading cells)
    const cells: (number | null)[] = [
        ...Array(startDay).fill(null),
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];
    // Pad to complete last row
    while (cells.length % 7 !== 0) cells.push(null);

    return (
        <View className="bg-slate-800/40 rounded-2xl overflow-hidden border border-primary/10">
            {/* Month nav header */}
            <View className="flex-row items-center justify-between px-4 py-4 border-b border-primary/10">
                <TouchableOpacity onPress={onPrevMonth} className="w-8 h-8 items-center justify-center" activeOpacity={0.7}>
                    <MaterialIcons name="chevron-left" size={24} color="#2bee79" />
                </TouchableOpacity>
                <Text className="text-slate-100 font-bold text-base" style={{ fontFamily: 'Lexend_700Bold' }}>
                    {MONTH_NAMES[month]} {year}
                </Text>
                <TouchableOpacity onPress={onNextMonth} className="w-8 h-8 items-center justify-center" activeOpacity={0.7}>
                    <MaterialIcons name="chevron-right" size={24} color="#2bee79" />
                </TouchableOpacity>
            </View>

            {/* Day name header */}
            <View className="flex-row px-2 pt-3 pb-1">
                {DAY_NAMES.map(d => (
                    <View key={d} className="flex-1 items-center">
                        <Text className="text-slate-500 text-xs font-bold" style={{ fontFamily: 'Lexend_700Bold' }}>{d}</Text>
                    </View>
                ))}
            </View>

            {/* Grid rows */}
            <View className="px-2 pb-3">
                {Array.from({ length: cells.length / 7 }, (_, row) => (
                    <View key={row} className="flex-row">
                        {cells.slice(row * 7, row * 7 + 7).map((day, col) => {
                            if (!day) return <View key={col} className="flex-1 m-0.5 h-9" />;

                            const isToday = year === todayYear && month === todayMonth && day === todayDate;
                            const isSelected = day === selectedDay;
                            const isActive = activeDays.has(day);

                            return (
                                <TouchableOpacity
                                    key={col}
                                    onPress={() => onDaySelect(day)}
                                    className={`flex-1 m-0.5 h-9 rounded-lg items-center justify-center
                                        ${isSelected ? 'bg-primary' : isActive ? 'bg-primary/20' : ''}
                                    `}
                                    activeOpacity={0.7}
                                >
                                    <Text
                                        className={`text-sm font-semibold
                                            ${isSelected ? 'text-background-dark' : isToday ? 'text-primary' : 'text-slate-300'}
                                        `}
                                        style={{ fontFamily: 'Lexend_500Medium' }}
                                    >
                                        {day}
                                    </Text>
                                    {isActive && !isSelected && (
                                        <View className="w-1 h-1 rounded-full bg-primary absolute bottom-1" />
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                ))}
            </View>
        </View>
    );
}
