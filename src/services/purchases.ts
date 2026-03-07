import { Platform, Alert } from 'react-native';
import {
  initConnection,
  endConnection,
  fetchProducts,
  requestPurchase,
  finishTransaction,
  purchaseUpdatedListener,
  purchaseErrorListener,
  type Purchase,
  type PurchaseError,
  type EventSubscription,
  ErrorCode,
} from 'react-native-iap';

// ---------------------------------------------------------------------------
// Product catalogue – IDs must match App Store Connect configuration
// ---------------------------------------------------------------------------
export const TIP_PRODUCTS = [
  { id: 'tip_small', label: 'Cafe', price: '1,99\u20AC', emoji: '\u2615' },
  { id: 'tip_medium', label: 'Repas', price: '4,99\u20AC', emoji: '\uD83C\uDF7D\uFE0F' },
  { id: 'tip_large', label: 'Benediction', price: '9,99\u20AC', emoji: '\uD83D\uDE4F' },
];

const productIds = TIP_PRODUCTS.map((p) => p.id);

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
let connected = false;
let purchaseUpdateSub: EventSubscription | null = null;
let purchaseErrorSub: EventSubscription | null = null;

// ---------------------------------------------------------------------------
// Initialise IAP connection
// ---------------------------------------------------------------------------
export async function initIAP(): Promise<boolean> {
  try {
    const result = await initConnection();
    connected = !!result;

    // Listen for successful purchases
    purchaseUpdateSub = purchaseUpdatedListener(
      async (purchase: Purchase) => {
        try {
          await finishTransaction({ purchase, isConsumable: true });
        } catch {
          // Finishing failed – will be retried on next launch
        }
      },
    );

    // Listen for purchase errors
    purchaseErrorSub = purchaseErrorListener((error: PurchaseError) => {
      if (error.code !== ErrorCode.UserCancelled) {
        Alert.alert('Erreur', "L'achat n'a pas pu etre finalise.");
      }
    });

    return connected;
  } catch {
    connected = false;
    return false;
  }
}

// ---------------------------------------------------------------------------
// Fetch real prices from the store (falls back to hardcoded catalogue)
// ---------------------------------------------------------------------------
export async function fetchTipProducts() {
  if (!connected) return TIP_PRODUCTS;

  try {
    const products = await fetchProducts({ skus: productIds });

    if (!products || products.length === 0) return TIP_PRODUCTS;

    return TIP_PRODUCTS.map((tip) => {
      const storeProduct = products.find((p) => p.id === tip.id);
      return storeProduct
        ? { ...tip, price: storeProduct.displayPrice ?? tip.price }
        : tip;
    });
  } catch {
    return TIP_PRODUCTS;
  }
}

// ---------------------------------------------------------------------------
// Purchase a tip product
// ---------------------------------------------------------------------------
export async function purchaseTip(productId: string): Promise<boolean> {
  if (!connected) {
    Alert.alert(
      'Indisponible',
      "Les achats integres ne sont pas disponibles pour le moment. Merci pour votre generosite !",
    );
    return false;
  }

  try {
    if (Platform.OS === 'ios') {
      await requestPurchase({
        request: { apple: { sku: productId } },
        type: 'in-app',
      });
    } else {
      await requestPurchase({
        request: { google: { skus: [productId] } },
        type: 'in-app',
      });
    }
    return true;
  } catch {
    // Error listener handles user-facing alerts
    return false;
  }
}

// ---------------------------------------------------------------------------
// Tear down listeners (call on unmount)
// ---------------------------------------------------------------------------
export function endIAP() {
  purchaseUpdateSub?.remove();
  purchaseErrorSub?.remove();
  purchaseUpdateSub = null;
  purchaseErrorSub = null;

  if (connected) {
    endConnection();
    connected = false;
  }
}
