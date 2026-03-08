import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { stopAudio } from '../src/services/audio';
import { AlarmTemplate } from '../src/types';
import {
  StandardTemplate,
  IncomingCallTemplate,
  WakeUpTemplate,
  ImmersiveTemplate,
} from '../src/components/alarm-templates';

export default function AlarmTriggeredScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { verseReference, verseText, alarmName, template } = useLocalSearchParams<{
    verseReference: string;
    verseText: string;
    alarmName: string;
    template: string;
  }>();

  async function handleClose() {
    await stopAudio();
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  }

  async function handleSilence() {
    await stopAudio();
  }

  async function handleSnooze() {
    await stopAudio();
    // TODO: schedule reminder in 5 min
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  }

  const templateProps = {
    verseText: verseText || '',
    verseReference: verseReference || '',
    alarmName: alarmName || 'Prayer Room',
    onSilence: handleSilence,
    onClose: handleClose,
    onSnooze: handleSnooze,
  };

  const activeTemplate = (template as AlarmTemplate) || 'standard';

  return (
    <View style={{ flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom }}>
      {activeTemplate === 'incoming-call' ? (
        <IncomingCallTemplate {...templateProps} />
      ) : activeTemplate === 'wake-up' ? (
        <WakeUpTemplate {...templateProps} />
      ) : activeTemplate === 'immersive' ? (
        <ImmersiveTemplate {...templateProps} />
      ) : (
        <StandardTemplate {...templateProps} />
      )}
    </View>
  );
}
