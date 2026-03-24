import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    ScrollView, Switch, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { actionsApi } from '../src/lib/api';

const ICON_OPTIONS = [
    'fitness-center', 'restaurant', 'water-drop', 'medication', 'self-improvement',
    'menu-book', 'music-note', 'code', 'work', 'directions-walk',
    'star', 'favorite', 'emoji-people', 'local-cafe', 'bedtime',
];

const COLOR_OPTIONS = [
    { label: 'Green', value: 'bg-primary', hex: '#2bee79' },
    { label: 'Blue', value: 'bg-blue-500', hex: '#3b82f6' },
    { label: 'Purple', value: 'bg-purple-500', hex: '#a855f7' },
    { label: 'Orange', value: 'bg-orange-500', hex: '#f97316' },
    { label: 'Pink', value: 'bg-pink-500', hex: '#ec4899' },
    { label: 'Teal', value: 'bg-teal-500', hex: '#14b8a6' },
    { label: 'Cyan', value: 'bg-cyan-500', hex: '#06b6d4' },
    { label: 'Red', value: 'bg-red-500', hex: '#ef4444' },
];

export default function CreateScreen() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [selectedIcon, setSelectedIcon] = useState('star');
    const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0]);
    const [remindersEnabled, setRemindersEnabled] = useState(false);
    const [reminderTime, setReminderTime] = useState('08:00');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleCreate = async () => {
        if (!name.trim()) { setError('Action name is required'); return; }
        setLoading(true);
        setError('');
        try {
            await actionsApi.create({
                name: name.trim(),
                icon: selectedIcon,
                color: selectedColor.value,
                remindersEnabled,
                reminderTime: remindersEnabled ? reminderTime : undefined,
            });
            router.back();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create action');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-background-dark" edges={['top']}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
                {/* Header */}
                <View className="px-4 pt-4 pb-3 flex-row items-center border-b border-primary/10">
                    <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center rounded-full" activeOpacity={0.7}>
                        <MaterialIcons name="close" size={22} color="#2bee79" />
                    </TouchableOpacity>
                    <Text className="flex-1 text-center pr-10 text-slate-100 text-lg font-bold" style={{ fontFamily: 'Lexend_700Bold' }}>
                        New Action
                    </Text>
                </View>

                <ScrollView className="flex-1 px-4 pt-6" showsVerticalScrollIndicator={false}>
                    {/* Name */}
                    <Text className="text-slate-400 text-xs uppercase tracking-wide mb-2" style={{ fontFamily: 'Lexend_700Bold' }}>Action Name</Text>
                    <TextInput
                        className="bg-slate-800/60 rounded-xl px-4 h-12 text-slate-100 text-sm mb-6 border border-slate-700"
                        style={{ fontFamily: 'Lexend_400Regular' }}
                        placeholder="e.g. Morning Run"
                        placeholderTextColor="#64748b"
                        value={name}
                        onChangeText={setName}
                        autoFocus
                    />

                    {/* Icon picker */}
                    <Text className="text-slate-400 text-xs uppercase tracking-wide mb-3" style={{ fontFamily: 'Lexend_700Bold' }}>Icon</Text>
                    <View className="flex-row flex-wrap gap-3 mb-6">
                        {ICON_OPTIONS.map(icon => (
                            <TouchableOpacity
                                key={icon}
                                onPress={() => setSelectedIcon(icon)}
                                className={`w-12 h-12 rounded-xl items-center justify-center border ${selectedIcon === icon ? 'bg-primary/20 border-primary' : 'bg-slate-800/50 border-slate-700'}`}
                                activeOpacity={0.7}
                            >
                                <MaterialIcons name={icon as any} size={22} color={selectedIcon === icon ? '#2bee79' : '#64748b'} />
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Color picker */}
                    <Text className="text-slate-400 text-xs uppercase tracking-wide mb-3" style={{ fontFamily: 'Lexend_700Bold' }}>Color</Text>
                    <View className="flex-row flex-wrap gap-3 mb-6">
                        {COLOR_OPTIONS.map(color => (
                            <TouchableOpacity
                                key={color.value}
                                onPress={() => setSelectedColor(color)}
                                className={`w-10 h-10 rounded-full border-2 ${selectedColor.value === color.value ? 'border-white' : 'border-transparent'}`}
                                style={{ backgroundColor: color.hex }}
                                activeOpacity={0.7}
                            >
                                {selectedColor.value === color.value && (
                                    <View className="flex-1 items-center justify-center">
                                        <MaterialIcons name="check" size={16} color="white" />
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Reminders */}
                    <View className="flex-row items-center justify-between bg-slate-800/40 px-4 py-4 rounded-xl border border-slate-700 mb-2">
                        <View>
                            <Text className="text-slate-100 text-sm font-medium" style={{ fontFamily: 'Lexend_500Medium' }}>
                                Daily Reminder
                            </Text>
                            <Text className="text-slate-500 text-xs" style={{ fontFamily: 'Lexend_400Regular' }}>
                                Get reminded every day
                            </Text>
                        </View>
                        <Switch
                            value={remindersEnabled}
                            onValueChange={setRemindersEnabled}
                            trackColor={{ false: '#334155', true: '#2bee7950' }}
                            thumbColor={remindersEnabled ? '#2bee79' : '#64748b'}
                        />
                    </View>

                    {error !== '' && (
                        <Text className="text-red-400 text-sm text-center mt-2" style={{ fontFamily: 'Lexend_400Regular' }}>{error}</Text>
                    )}

                    {/* Submit */}
                    <TouchableOpacity
                        onPress={handleCreate}
                        disabled={loading}
                        className="bg-primary rounded-xl h-14 items-center justify-center mt-6 mb-12"
                        activeOpacity={0.85}
                    >
                        {loading ? (
                            <ActivityIndicator color="#102217" />
                        ) : (
                            <Text className="text-background-dark font-bold text-base" style={{ fontFamily: 'Lexend_700Bold' }}>
                                Create Action
                            </Text>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
