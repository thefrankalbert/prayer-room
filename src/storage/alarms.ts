import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alarm } from '../types';

const ALARMS_KEY = 'prayer_room_alarms';

export async function getAlarms(): Promise<Alarm[]> {
  const data = await AsyncStorage.getItem(ALARMS_KEY);
  return data ? JSON.parse(data) : [];
}

export async function saveAlarm(alarm: Alarm): Promise<void> {
  const alarms = await getAlarms();
  const index = alarms.findIndex((a) => a.id === alarm.id);
  if (index >= 0) {
    alarms[index] = alarm;
  } else {
    alarms.push(alarm);
  }
  await AsyncStorage.setItem(ALARMS_KEY, JSON.stringify(alarms));
}

export async function deleteAlarm(id: string): Promise<void> {
  const alarms = await getAlarms();
  await AsyncStorage.setItem(
    ALARMS_KEY,
    JSON.stringify(alarms.filter((a) => a.id !== id))
  );
}
