import React, { useState, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { actionsApi, logsApi, type ApiAction } from '../src/lib/api';
import TimePicker from '../src/components/time-picker';

export default function RegisterScreen() {
    const router = useRouter();
    const { actionId } = useLocalSearchParams<{ actionId?: string }>();

    const [actions, setActions] = useState<ApiAction[]>([]);
    const [selectedActionId, setSelectedActionId] = useState<string | undefined>(actionId);
    const [note, setNote] = useState('');
    const [loggedAt, setLoggedAt] = useState(() => {
        const now = new Date();
        const h = String(now.getHours()).padStart(2, '0');
        const m = String(now.getMinutes()).padStart(2, '0');
        return `${h}:${m}`;
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        actionsApi.list().then(setActions);
    }, []);

    const selectedAction = actions.find(a => a.id === selectedActionId);

    const handleLog = async () => {
        setLoading(true);
        setError('');
        try {
            // Build ISO datetime using today's date + picked time
            const today = new Date().toISOString().slice(0, 10);
            const isoDateTime = `${today}T${loggedAt}:00`;
            await logsApi.create({
                actionId: selectedActionId,
                loggedAt: isoDateTime,
                note: note.trim() || undefined,
            });
            router.back();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to log action');
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
                        Log Action
                    </Text>
                </View>

                <ScrollView className="flex-1 px-4 pt-6" showsVerticalScrollIndicator={false}>
                    {/* Action selector */}
                    <Text className="text-slate-400 text-xs uppercase tracking-wide mb-3" style={{ fontFamily: 'Lexend_700Bold' }}>Action</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ gap: 8, paddingBottom: 12 }}>
                        {/* No action */}
                        <TouchableOpacity
                            onPress={() => setSelectedActionId(undefined)}
                            className={`px-4 py-2 rounded-full border ${!selectedActionId ? 'bg-primary/20 border-primary' : 'bg-slate-800/50 border-slate-700'}`}
                            activeOpacity={0.7}
                        >
                            <Text className={`text-sm font-medium ${!selectedActionId ? 'text-primary' : 'text-slate-400'}`}
                                style={{ fontFamily: 'Lexend_500Medium' }}>Quick Log</Text>
                        </TouchableOpacity>
                        {actions.map(action => (
                            <TouchableOpacity
                                key={action.id}
                                onPress={() => setSelectedActionId(action.id)}
                                className={`px-4 py-2 rounded-full border flex-row items-center gap-2 ${selectedActionId === action.id ? 'bg-primary/20 border-primary' : 'bg-slate-800/50 border-slate-700'}`}
                                activeOpacity={0.7}
                            >
                                <MaterialIcons name={action.icon as any} size={14} color={selectedActionId === action.id ? '#2bee79' : '#64748b'} />
                                <Text className={`text-sm font-medium ${selectedActionId === action.id ? 'text-primary' : 'text-slate-400'}`}
                                    style={{ fontFamily: 'Lexend_500Medium' }}>{action.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Time */}
                    <Text className="text-slate-400 text-xs uppercase tracking-wide mb-3 mt-4" style={{ fontFamily: 'Lexend_700Bold' }}>Time</Text>
                    <TimePicker value={loggedAt} onChange={setLoggedAt} label="Logged at" />

                    {/* Note */}
                    <Text className="text-slate-400 text-xs uppercase tracking-wide mb-3 mt-6" style={{ fontFamily: 'Lexend_700Bold' }}>Note (optional)</Text>
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

                    {/* Log button */}
                    <TouchableOpacity
                        onPress={handleLog}
                        disabled={loading}
                        className="bg-primary rounded-xl h-14 items-center justify-center mt-8 mb-12"
                        activeOpacity={0.85}
                    >
                        {loading ? (
                            <ActivityIndicator color="#102217" />
                        ) : (
                            <Text className="text-background-dark font-bold text-base" style={{ fontFamily: 'Lexend_700Bold' }}>
                                {selectedAction ? `Log "${selectedAction.name}"` : 'Log Quick Action'}
                            </Text>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
