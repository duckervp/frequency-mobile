import { Redirect } from 'expo-router';
import { useAuth } from '../src/hooks/use-auth';
import { View } from 'react-native';

export default function Index() {
    const { token, isLoading } = useAuth();
    if (isLoading) return <View className="flex-1 bg-background-dark" />;
    return token ? <Redirect href="/(tabs)/dashboard" /> : <Redirect href="/(auth)/login" />;
}
