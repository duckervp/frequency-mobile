import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import type { ApiAction } from '../lib/api';

interface CalendarSelectProps {
    actions: ApiAction[];
    selectedActionId: string | null;
    onChange: (id: string | null) => void;
    loading?: boolean;
}

export default function CalendarSelect({ actions, selectedActionId, onChange, loading }: CalendarSelectProps) {
    const [open, setOpen] = useState(false);
    const selected = actions.find(a => a.id === selectedActionId);

    return (
        <>
            <TouchableOpacity
                onPress={() => setOpen(true)}
                className="flex-row items-center justify-between bg-slate-800/50 rounded-xl px-4 py-3 border border-primary/10"
                activeOpacity={0.8}
                disabled={loading}
            >
                <Text className="text-slate-300 text-sm" style={{ fontFamily: 'Lexend_400Regular' }}>
                    {loading ? 'Loading...' : selected ? selected.name : 'All Actions'}
                </Text>
                <MaterialIcons name="expand-more" size={20} color="#64748b" />
            </TouchableOpacity>

            <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
                <TouchableOpacity className="flex-1 bg-black/60" onPress={() => setOpen(false)} activeOpacity={1}>
                    <View className="absolute bottom-0 left-0 right-0 bg-slate-900 rounded-t-3xl border-t border-primary/10 pb-10">
                        <View className="w-10 h-1 bg-slate-700 rounded-full mx-auto mt-3 mb-4" />
                        <Text className="text-slate-100 font-bold text-base px-6 mb-3" style={{ fontFamily: 'Lexend_700Bold' }}>
                            Filter by Action
                        </Text>
                        <ScrollView>
                            {/* All actions option */}
                            <TouchableOpacity
                                className={`flex-row items-center px-6 py-3 ${!selectedActionId ? 'bg-primary/10' : ''}`}
                                onPress={() => { onChange(null); setOpen(false); }}
                                activeOpacity={0.7}
                            >
                                <Text className={`flex-1 text-sm ${!selectedActionId ? 'text-primary font-bold' : 'text-slate-300'}`}
                                    style={{ fontFamily: selectedActionId ? 'Lexend_400Regular' : 'Lexend_700Bold' }}>
                                    All Actions
                                </Text>
                                {!selectedActionId && <MaterialIcons name="check" size={18} color="#2bee79" />}
                            </TouchableOpacity>

                            {actions.map(action => (
                                <TouchableOpacity
                                    key={action.id}
                                    className={`flex-row items-center px-6 py-3 ${selectedActionId === action.id ? 'bg-primary/10' : ''}`}
                                    onPress={() => { onChange(action.id); setOpen(false); }}
                                    activeOpacity={0.7}
                                >
                                    <Text className={`flex-1 text-sm ${selectedActionId === action.id ? 'text-primary font-bold' : 'text-slate-300'}`}
                                        style={{ fontFamily: selectedActionId === action.id ? 'Lexend_700Bold' : 'Lexend_400Regular' }}>
                                        {action.name}
                                    </Text>
                                    {selectedActionId === action.id && <MaterialIcons name="check" size={18} color="#2bee79" />}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </TouchableOpacity>
            </Modal>
        </>
    );
}
