import React from 'react';
import { View, Text, Image } from 'react-native';

interface SummaryCardProps {
    coverImage?: string;
    totalActions: number;
    loading?: boolean;
}

export default function SummaryCard({ coverImage, totalActions, loading }: SummaryCardProps) {
    return (
        <View className="mx-4 mt-4 mb-2 rounded-2xl overflow-hidden bg-slate-800/50 border border-primary/10">
            {coverImage && (
                <Image
                    source={{ uri: coverImage }}
                    className="w-full h-32"
                    resizeMode="cover"
                />
            )}
            <View className="px-4 py-4">
                {loading ? (
                    <View className="h-6 w-28 bg-slate-700 rounded" />
                ) : (
                    <View className="flex-row items-center gap-3">
                        <View className="w-10 h-10 rounded-xl bg-primary/20 items-center justify-center">
                            <Text className="text-primary text-xl font-bold" style={{ fontFamily: 'Lexend_700Bold' }}>
                                {totalActions}
                            </Text>
                        </View>
                        <Text className="text-slate-300 text-sm" style={{ fontFamily: 'Lexend_400Regular' }}>
                            {totalActions === 1 ? 'action logged' : 'actions logged'}
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );
}
