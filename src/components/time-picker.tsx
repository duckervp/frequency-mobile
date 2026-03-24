import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface TimePickerProps {
    value: string; // "HH:MM"
    onChange: (value: string) => void;
    label?: string;
}

function range(start: number, end: number) {
    return Array.from({ length: end - start + 1 }, (_, i) => i + start);
}

export default function TimePicker({ value, onChange, label = 'Time' }: TimePickerProps) {
    const [open, setOpen] = useState(false);
    const [hour, setHour] = useState(() => parseInt(value.split(':')[0] || '8', 10));
    const [minute, setMinute] = useState(() => parseInt(value.split(':')[1] || '0', 10));

    const confirm = () => {
        const h = String(hour).padStart(2, '0');
        const m = String(minute).padStart(2, '0');
        onChange(`${h}:${m}`);
        setOpen(false);
    };

    const displayValue = (() => {
        const h = parseInt(value.split(':')[0]);
        const m = value.split(':')[1] || '00';
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return `${h12}:${m} ${ampm}`;
    })();

    return (
        <>
            <TouchableOpacity
                onPress={() => setOpen(true)}
                className="flex-row items-center justify-between bg-slate-800/50 rounded-xl px-4 py-3 border border-primary/10"
                activeOpacity={0.8}
            >
                <Text className="text-slate-400 text-xs uppercase tracking-wide" style={{ fontFamily: 'Lexend_700Bold' }}>
                    {label}
                </Text>
                <View className="flex-row items-center gap-2">
                    <Text className="text-slate-100 text-sm font-semibold" style={{ fontFamily: 'Lexend_500Medium' }}>
                        {displayValue}
                    </Text>
                    <MaterialIcons name="schedule" size={16} color="#64748b" />
                </View>
            </TouchableOpacity>

            <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
                <TouchableOpacity className="flex-1 bg-black/60" onPress={() => setOpen(false)} activeOpacity={1}>
                    <View className="absolute bottom-0 left-0 right-0 bg-slate-900 rounded-t-3xl border-t border-primary/10 px-6 pb-10 pt-4">
                        <View className="w-10 h-1 bg-slate-700 rounded-full mx-auto mb-6" />
                        <Text className="text-slate-100 font-bold text-base mb-4" style={{ fontFamily: 'Lexend_700Bold' }}>
                            Pick {label}
                        </Text>
                        <View className="flex-row gap-4 justify-center mb-6">
                            {/* Hour picker */}
                            <View className="flex-1">
                                <Text className="text-slate-500 text-xs text-center mb-2" style={{ fontFamily: 'Lexend_400Regular' }}>Hour</Text>
                                <ScrollView className="h-40" showsVerticalScrollIndicator={false}>
                                    {range(0, 23).map(h => (
                                        <TouchableOpacity key={h} onPress={() => setHour(h)}
                                            className={`py-2 rounded-lg mb-1 ${h === hour ? 'bg-primary/20' : ''}`}>
                                            <Text className={`text-center text-sm ${h === hour ? 'text-primary font-bold' : 'text-slate-400'}`}
                                                style={{ fontFamily: h === hour ? 'Lexend_700Bold' : 'Lexend_400Regular' }}>
                                                {String(h).padStart(2, '0')}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                            <View className="justify-center pb-2">
                                <Text className="text-primary text-2xl font-bold">:</Text>
                            </View>
                            {/* Minute picker */}
                            <View className="flex-1">
                                <Text className="text-slate-500 text-xs text-center mb-2" style={{ fontFamily: 'Lexend_400Regular' }}>Minute</Text>
                                <ScrollView className="h-40" showsVerticalScrollIndicator={false}>
                                    {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map(m => (
                                        <TouchableOpacity key={m} onPress={() => setMinute(m)}
                                            className={`py-2 rounded-lg mb-1 ${m === minute ? 'bg-primary/20' : ''}`}>
                                            <Text className={`text-center text-sm ${m === minute ? 'text-primary font-bold' : 'text-slate-400'}`}
                                                style={{ fontFamily: m === minute ? 'Lexend_700Bold' : 'Lexend_400Regular' }}>
                                                {String(m).padStart(2, '0')}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        </View>
                        <TouchableOpacity onPress={confirm}
                            className="bg-primary rounded-xl py-4 items-center">
                            <Text className="text-background-dark font-bold" style={{ fontFamily: 'Lexend_700Bold' }}>Confirm</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </>
    );
}
