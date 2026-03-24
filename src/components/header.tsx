import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

interface HeaderProps {
    title: string;
    showBack?: boolean;
}

export default function Header({ title, showBack = false }: HeaderProps) {
    const router = useRouter();
    return (
        <View className="bg-background-dark/80 px-4 pt-4 pb-3 flex-row items-center border-b border-primary/10">
            {showBack ? (
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-10 h-10 items-center justify-center rounded-full"
                    activeOpacity={0.7}
                >
                    <MaterialIcons name="arrow-back-ios" size={22} color="#2bee79" />
                </TouchableOpacity>
            ) : (
                <View className="w-10" />
            )}
            <Text className="flex-1 text-center text-slate-100 text-lg font-bold" style={{ fontFamily: 'Lexend_700Bold' }}>
                {title}
            </Text>
            <View className="w-10" />
        </View>
    );
}
