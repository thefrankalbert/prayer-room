import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from '../src/contexts/ThemeContext';
import { LanguageProvider } from '../src/contexts/LanguageContext';
import { onNotificationResponse } from '../src/services/notifications';

function RootLayoutInner() {
  const { colors, mode } = useTheme();
  const router = useRouter();

  useEffect(() => {
    const subscription = onNotificationResponse((response) => {
      const data = response.notification.request.content.data;
      if (data?.verseReference) {
        router.push({
          pathname: '/alarm-triggered',
          params: {
            verseReference: data.verseReference as string,
            verseText: response.notification.request.content.body || '',
            alarmName: response.notification.request.content.title || 'Prayer Room',
            template: (data.template as string) || 'standard',
          },
        });
      }
    });
    return () => subscription.remove();
  }, []);

  return (
    <>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="alarm-triggered"
          options={{ presentation: 'fullScreenModal' }}
        />
        <Stack.Screen
          name="alarm"
          options={{ presentation: 'modal' }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <RootLayoutInner />
      </LanguageProvider>
    </ThemeProvider>
  );
}
