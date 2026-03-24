import React, { useState, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { logsApi } from '../src/lib/api';
import TimePicker from '../src/components/time-picker';

export default function EditScreen() {
    const router = useRouter();
    const { logId } = useLocalSearchParams<{ logId: string }>();

    const [note, setNote] = useState('');
    const [loggedAt, setLoggedAt] = useState('08:00');
    const [actionName, setActionName] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!logId) return;
        logsApi.get(logId).then(data => {
            setNote(data.log.note ?? '');
            const d = new Date(data.log.loggedAt);
            const h = String(d.getHours()).padStart(2, '0');
            const m = String(d.getMinutes()).padStart(2, '0');
            setLoggedAt(`${h}:${m}`);
            setActionName(data.action?.name ?? 'Quick Log');
        }).finally(() => setLoading(false));
    }, [logId]);

    const handleSave = async () => {
        if (!logId) return;
        setSaving(true);
        setError('');
        try {
            const today = new Date().toISOString().slice(0, 10);
            await logsApi.update(logId, {
                loggedAt: `${today}T${loggedAt}:00`,
                note: note.trim() || undefined,
            });
            router.back();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = () => {
        if (!logId) return;
        Alert.alert('Delete Log', 'Are you sure you want to delete this log entry?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive', onPress: async () => {
                    await logsApi.remove(logId);
                    router.back();
                },
            },
        ]);
    };

    return (
        <SafeAreaView className="flex-1 bg-background-dark" edges={['top']}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
                {/* Header */}
                <View className="px-4 pt-4 pb-3 flex-row items-center border-b border-primary/10">
                    <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center rounded-full" activeOpacity={0.7}>
                        <MaterialIcons name="close" size={22} color="#2bee79" />
                    </TouchableOpacity>
                    <Text className="flex-1 text-center text-slate-100 text-lg font-bold" style={{ fontFamily: 'Lexend_700Bold' }}>
                        Edit Log
                    </Text>
                    <TouchableOpacity onPress={handleDelete} className="w-10 h-10 items-center justify-center rounded-full" activeOpacity={0.7}>
                        <MaterialIcons name="delete-outline" size={22} color="#ef4444" />
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <View className="flex-1 items-center justify-center">
                        <ActivityIndicator size="large" color="#2bee79" />
                    </View>
                ) : (
                    <ScrollView className="flex-1 px-4 pt-6" showsVerticalScrollIndicator={false}>
                        {/* Action name (read-only) */}
                        <View className="bg-slate-800/40 rounded-xl px-4 py-4 border border-primary/10 mb-6">
                            <Text className="text-slate-400 text-xs uppercase tracking-wide mb-1" style={{ fontFamily: 'Lexend_700Bold' }}>Action</Text>
                            <Text className="text-slate-100 text-base font-semibold" style={{ fontFamily: 'Lexend_500Medium' }}>
                                {actionName}
                            </Text>
                        </View>

                        {/* Time */}
                        <Text className="text-slate-400 text-xs uppercase tracking-wide mb-3" style={{ fontFamily: 'Lexend_700Bold' }}>Time</Text>
                        <TimePicker value={loggedAt} onChange={setLoggedAt} label="Logged at" />

                        {/* Note */}
                        <Text className="text-slate-400 text-xs uppercase tracking-wide mb-3 mt-6" style={{ fontFamily: 'Lexend_700Bold' }}>Note</Text>
                        <TextInput
                            className="bg-slate-800/60 rounded-xl px-4 py-3 text-slate-100 text-sm border border-slate-700"
                            style={{ fontFamily: 'Lexend_400Regular', minHeight: 80, textAlignVertical: 'top' }}
                            placeholder="Add a note..."
                            placeholderTextColor="#64748b"
                            value={note}
                            onChangeText={setNote}
                            multiline
                        />

                        {error !== '' && (
                            <Text className="text-red-400 text-sm text-center mt-3" style={{ fontFamily: 'Lexend_400Regular' }}>{error}</Text>
                        )}

                        <TouchableOpacity
                            onPress={handleSave}
                            disabled={saving}
                            className="bg-primary rounded-xl h-14 items-center justify-center mt-8 mb-12"
                            activeOpacity={0.85}
                        >
                            {saving ? (
                                <ActivityIndicator color="#102217" />
                            ) : (
                                <Text className="text-background-dark font-bold text-base" style={{ fontFamily: 'Lexend_700Bold' }}>
                                    Save Changes
                                </Text>
                            )}
                        </TouchableOpacity>
                    </ScrollView>
                )}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
