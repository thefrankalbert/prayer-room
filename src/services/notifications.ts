import * as Notifications from 'expo-notifications';
import { Alarm } from '../types';
import { getAllPacks } from '../storage/packs';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestPermissions(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleAlarm(alarm: Alarm): Promise<void> {
  await cancelAlarm(alarm.id);

  if (!alarm.enabled) return;

  const packs = await getAllPacks();
  const pack = packs.find((p) => p.id === alarm.packId);
  if (!pack) return;

  const [startH, startM] = alarm.startTime.split(':').map(Number);
  const [endH, endM] = alarm.endTime.split(':').map(Number);
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  let currentMinute = startMinutes;
  let notifIndex = 0;

  while (currentMinute < endMinutes) {
    const hour = Math.floor(currentMinute / 60);
    const minute = currentMinute % 60;
    const verse = pack.verses[notifIndex % pack.verses.length];

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `Prayer Room - ${alarm.name}`,
        body: `${verse.reference}\n${verse.text}`,
        data: { alarmId: alarm.id, verseReference: verse.reference },
        sound: alarm.audio.type === 'native' ? true : undefined,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
      identifier: `${alarm.id}_${notifIndex}`,
    });

    currentMinute += alarm.intervalMinutes;
    notifIndex++;
  }
}

export async function cancelAlarm(alarmId: string): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const notif of scheduled) {
    if (notif.identifier.startsWith(alarmId)) {
      await Notifications.cancelScheduledNotificationAsync(notif.identifier);
    }
  }
}

export async function cancelAllAlarms(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export function onNotificationReceived(
  callback: (notification: Notifications.Notification) => void
): Notifications.EventSubscription {
  return Notifications.addNotificationReceivedListener(callback);
}

export function onNotificationResponse(
  callback: (response: Notifications.NotificationResponse) => void
): Notifications.EventSubscription {
  return Notifications.addNotificationResponseReceivedListener(callback);
}
