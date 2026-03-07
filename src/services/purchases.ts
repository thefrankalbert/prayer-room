import { Alert } from 'react-native';

// Product catalogue – IDs must match App Store Connect configuration
export const TIP_PRODUCTS = [
  { id: 'tip_small', label: 'Cafe', price: '1,99\u20AC', emoji: '\u2615' },
  { id: 'tip_medium', label: 'Repas', price: '4,99\u20AC', emoji: '\uD83C\uDF7D\uFE0F' },
  { id: 'tip_large', label: 'Benediction', price: '9,99\u20AC', emoji: '\uD83D\uDE4F' },
];

// ---------------------------------------------------------------------------
// IAP is NOT imported here to avoid Metro bundling react-native-nitro-modules
// which crashes in Expo Go. All IAP functions are no-ops until a dev build
// with native modules is available.
// ---------------------------------------------------------------------------
let connected = false;

export async function initIAP(): Promise<boolean> {
  // IAP requires a development build with native modules.
  // In Expo Go this will always return false.
  connected = false;
  return false;
}

export async function fetchTipProducts() {
  return TIP_PRODUCTS;
}

export async function purchaseTip(productId: string): Promise<boolean> {
  Alert.alert(
    'Bientot disponible',
    "Les achats integres seront disponibles dans la prochaine version. Merci pour votre generosite !",
  );
  return false;
}

export function endIAP() {
  connected = false;
}
