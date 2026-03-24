import React, { useState, useEffect } from 'react';
import {
    View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { actionsApi, type ApiAction } from '../src/lib/api';

export default function ManageActionsScreen() {
    const router = useRouter();
    const [actions, setActions] = useState<ApiAction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        actionsApi.list().then(setActions).finally(() => setLoading(false));
    }, []);

    const handleDelete = (action: ApiAction) => {
        Alert.alert('Delete Action', `Delete "${action.name}"? All logs for this action will remain but won't link back to it.`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive', onPress: async () => {
                    await actionsApi.remove(action.id);
                    setActions(prev => prev.filter(a => a.id !== action.id));
                },
            },
        ]);
    };

    return (
        <SafeAreaView className="flex-1 bg-background-dark" edges={['top']}>
            {/* Header */}
            <View className="px-4 pt-4 pb-3 flex-row items-center border-b border-primary/10">
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center rounded-full" activeOpacity={0.7}>
                    <MaterialIcons name="arrow-back-ios" size={20} color="#2bee79" />
                </TouchableOpacity>
                <Text className="flex-1 text-center pr-10 text-slate-100 text-lg font-bold" style={{ fontFamily: 'Lexend_700Bold' }}>
                    My Actions
                </Text>
            </View>

            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#2bee79" />
                </View>
            ) : (
                <ScrollView className="flex-1" showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingTop: 16, paddingBottom: 32 }}>
                    {actions.length === 0 ? (
                        <View className="items-center py-16 px-8">
                            <MaterialIcons name="playlist-add" size={48} color="#334155" />
                            <Text className="text-slate-400 text-base font-semibold text-center mt-4"
                                style={{ fontFamily: 'Lexend_500Medium' }}>No actions yet</Text>
                            <Text className="text-slate-500 text-sm text-center mt-2"
                                style={{ fontFamily: 'Lexend_400Regular' }}>
                                Create your first action to get started tracking habits.
                            </Text>
                        </View>
                    ) : (
                        <View className="px-4 gap-2">
                            {actions.map(action => (
                                <View
                                    key={action.id}
                                    className="flex-row items-center bg-slate-800/50 rounded-xl px-4 py-3 border border-slate-700"
                                >
                                    <View className="w-10 h-10 rounded-xl bg-primary/20 items-center justify-center mr-4 shrink-0">
                                        <MaterialIcons name={action.icon as any} size={20} color="#2bee79" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-slate-100 text-sm font-semibold"
                                            style={{ fontFamily: 'Lexend_500Medium' }}>{action.name}</Text>
                                        {action.remindersEnabled && action.reminderTime && (
                                            <Text className="text-slate-500 text-xs mt-0.5"
                                                style={{ fontFamily: 'Lexend_400Regular' }}>
                                                🔔 Reminder at {action.reminderTime}
                                            </Text>
                                        )}
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => handleDelete(action)}
                                        className="w-9 h-9 items-center justify-center ml-2"
                                        activeOpacity={0.7}
                                    >
                                        <MaterialIcons name="delete-outline" size={20} color="#64748b" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Create action button */}
                    <TouchableOpacity
                        onPress={() => router.push('/create')}
                        className="mx-4 mt-6 bg-primary rounded-xl h-14 items-center justify-center flex-row gap-2"
                        activeOpacity={0.85}
                    >
                        <MaterialIcons name="add" size={22} color="#102217" />
                        <Text className="text-background-dark font-bold text-base" style={{ fontFamily: 'Lexend_700Bold' }}>
                            New Action
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            )}
        </SafeAreaView>
    );
}
