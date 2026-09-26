import { PaymentMethodsConfig, DEFAULT_PAYMENT_METHODS_CONFIG, PaymentMethodVisualConfig } from '../types/paymentMethods';
import { safeLocalStorageGetItem, safeLocalStorageSetItem } from '../utils/safeStorage';

export const PAYMENT_METHODS_CONFIG_KEY = 'payment_methods_config';

let inMemoryPaymentMethodsCache: PaymentMethodsConfig | null = null;

/**
 * Retrieve current payment methods visual config from memory/localStorage or defaults
 */
export function getStoredPaymentMethodsConfig(): PaymentMethodsConfig {
  if (inMemoryPaymentMethodsCache) {
    return inMemoryPaymentMethodsCache;
  }

  if (typeof window === 'undefined') {
    return { ...DEFAULT_PAYMENT_METHODS_CONFIG };
  }

  try {
    const raw = safeLocalStorageGetItem(PAYMENT_METHODS_CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const resolved: PaymentMethodsConfig = {
        d17: { ...DEFAULT_PAYMENT_METHODS_CONFIG.d17, ...(parsed.d17 || {}) },
        rib: { ...DEFAULT_PAYMENT_METHODS_CONFIG.rib, ...(parsed.rib || {}) },
        cash_mornag: { ...DEFAULT_PAYMENT_METHODS_CONFIG.cash_mornag, ...(parsed.cash_mornag || parsed.wafacash || {}) },
        cash_mourouj: { ...DEFAULT_PAYMENT_METHODS_CONFIG.cash_mourouj, ...(parsed.cash_mourouj || parsed.cash || parsed.direct || {}) },
        wafacash: { ...DEFAULT_PAYMENT_METHODS_CONFIG.cash_mornag, ...(parsed.cash_mornag || parsed.wafacash || {}) },
        cash: { ...DEFAULT_PAYMENT_METHODS_CONFIG.cash_mourouj, ...(parsed.cash_mourouj || parsed.cash || parsed.direct || {}) }
      };
      inMemoryPaymentMethodsCache = resolved;
      return resolved;
    }
  } catch (e) {
    console.warn('[PaymentMethodsStore] Error reading payment_methods_config:', e);
  }

  inMemoryPaymentMethodsCache = { ...DEFAULT_PAYMENT_METHODS_CONFIG };
  return inMemoryPaymentMethodsCache;
}

/**
 * Persist payment methods visual config to memory, localStorage and broadcast event
 */
export function saveStoredPaymentMethodsConfig(config: PaymentMethodsConfig): void {
  inMemoryPaymentMethodsCache = config;

  if (typeof window === 'undefined') return;

  try {
    const serialized = JSON.stringify(config);
    safeLocalStorageSetItem(PAYMENT_METHODS_CONFIG_KEY, serialized);
  } catch (e) {
    console.warn('[PaymentMethodsStore] Non-fatal error persisting to localStorage:', e);
  }

  try {
    // Broadcast event for all components in same window
    window.dispatchEvent(new CustomEvent('payment_methods_config_updated', { detail: config }));
    // Storage event for other tabs / frames
    window.dispatchEvent(new Event('storage'));

    // Sync to server settings
    fetch('/api/admin/config/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payment_methods_config: config })
    }).catch(() => {});
  } catch {
    // Ignored non-blocking sync
  }
}

/**
 * Helper to get a specific method config by ID
 */
export function getPaymentMethodConfig(methodId: string, allConfigs?: PaymentMethodsConfig): PaymentMethodVisualConfig {
  const configs = allConfigs || getStoredPaymentMethodsConfig();
  const normalized = (methodId || '').toLowerCase();

  if (normalized === 'd17') return configs.d17;
  if (normalized === 'rib' || normalized === 'virement') return configs.rib;
  if (normalized === 'cash_mornag' || normalized === 'mornag' || normalized === 'morneg' || normalized === 'wafacash' || normalized === 'mandat') {
    return configs.cash_mornag;
  }
  if (
    normalized === 'cash_mourouj' || 
    normalized === 'mourouj' || 
    normalized === 'cash' || 
    normalized === 'direct' || 
    normalized.includes('espèce') || 
    normalized.includes('espece')
  ) {
    return configs.cash_mourouj;
  }

  return {
    id: methodId,
    label: methodId,
    customIconUrl: '',
    size: 24,
    borderRadiusClass: 'rounded-md'
  };
}
