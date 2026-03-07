import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from '../src/contexts/ThemeContext';
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
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          contentStyle: { backgroundColor: colors.background },
          headerShadowVisible: false,
        }}
      />
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootLayoutInner />
    </ThemeProvider>
  );
}
