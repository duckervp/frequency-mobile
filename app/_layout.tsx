import '../global.css';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Lexend_400Regular, Lexend_500Medium, Lexend_700Bold } from '@expo-google-fonts/lexend';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { AuthProvider } from '../src/hooks/use-auth';

// Keep splash screen visible while fonts load
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const [fontsLoaded] = useFonts({
        Lexend_400Regular,
        Lexend_500Medium,
        Lexend_700Bold,
    });

    useEffect(() => {
        if (fontsLoaded) {
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded]);

    if (!fontsLoaded) return null;

    return (
        <AuthProvider>
            <StatusBar style="light" />
            <Stack screenOptions={{ headerShown: false }} />
        </AuthProvider>
    );
}
