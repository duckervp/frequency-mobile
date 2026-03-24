import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface ActionItemProps {
    title: string;
    time: string;
    note?: string;
    category?: string;
    icon?: string;
    onEdit?: () => void;
    onDelete?: () => void;
}

export default function ActionItem({ title, time, note, icon = 'task-alt', onEdit, onDelete }: ActionItemProps) {
    const handleDelete = () => {
        Alert.alert('Delete Log', 'Are you sure you want to delete this log?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: onDelete },
        ]);
    };

    return (
        <View className="flex-row items-center gap-3 mx-4 my-0.5 p-3 rounded-xl bg-slate-800/50">
            {/* Icon */}
            <View className="w-10 h-10 rounded-full bg-primary/20 items-center justify-center shrink-0">
                <MaterialIcons name={(icon as any) || 'task-alt'} size={20} color="#2bee79" />
            </View>

            {/* Text */}
            <View className="flex-1">
                <Text className="text-slate-100 text-sm font-medium" style={{ fontFamily: 'Lexend_500Medium' }}>
                    {title}
                </Text>
                <Text className="text-slate-500 text-xs mt-0.5" style={{ fontFamily: 'Lexend_400Regular' }}>
                    {time}{note ? ` · ${note}` : ''}
                </Text>
            </View>

            {/* Actions */}
            <View className="flex-row gap-2">
                {onEdit && (
                    <TouchableOpacity onPress={onEdit} className="w-8 h-8 items-center justify-center" activeOpacity={0.7}>
                        <MaterialIcons name="edit" size={18} color="#94a3b8" />
                    </TouchableOpacity>
                )}
                {onDelete && (
                    <TouchableOpacity onPress={handleDelete} className="w-8 h-8 items-center justify-center" activeOpacity={0.7}>
                        <MaterialIcons name="delete-outline" size={18} color="#94a3b8" />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}
