export type PaymentMethodId = 'd17' | 'rib' | 'wafacash' | 'cash' | 'direct';

export type PaymentBorderRadiusClass = 'rounded-none' | 'rounded-md' | 'rounded-xl' | 'rounded-full';

export interface PaymentMethodVisualConfig {
  id: PaymentMethodId | string;
  label: string;
  customIconUrl?: string; // base64 Data URL or public/remote image URL (.gif, .jpeg, .png, .jpg, .ico, .svg)
  size?: number; // width/height in px (16px - 64px, default 24px)
  borderRadiusClass?: PaymentBorderRadiusClass; // 'rounded-none' | 'rounded-md' | 'rounded-xl' | 'rounded-full'
}

export interface PaymentMethodsConfig {
  d17: PaymentMethodVisualConfig;
  rib: PaymentMethodVisualConfig;
  wafacash: PaymentMethodVisualConfig;
  cash: PaymentMethodVisualConfig;
}

export const DEFAULT_PAYMENT_METHODS_CONFIG: PaymentMethodsConfig = {
  d17: {
    id: 'd17',
    label: 'D17 Poste Mobile',
    customIconUrl: '',
    size: 24,
    borderRadiusClass: 'rounded-md'
  },
  rib: {
    id: 'rib',
    label: 'Virement RIB',
    customIconUrl: '',
    size: 24,
    borderRadiusClass: 'rounded-md'
  },
  wafacash: {
    id: 'wafacash',
    label: 'Wafacash Express',
    customIconUrl: '',
    size: 24,
    borderRadiusClass: 'rounded-md'
  },
  cash: {
    id: 'cash',
    label: 'Paiement Direct Espèces',
    customIconUrl: '',
    size: 24,
    borderRadiusClass: 'rounded-md'
  }
};

export const PAYMENT_BORDER_RADIUS_OPTIONS: { id: PaymentBorderRadiusClass; label: string; previewClass: string }[] = [
  { id: 'rounded-none', label: 'Carré (rounded-none)', previewClass: 'rounded-none' },
  { id: 'rounded-md', label: 'Légèrement arrondi (rounded-md)', previewClass: 'rounded-md' },
  { id: 'rounded-xl', label: 'Très arrondi (rounded-xl)', previewClass: 'rounded-xl' },
  { id: 'rounded-full', label: 'Cercle (rounded-full)', previewClass: 'rounded-full' }
];

export const ACCEPTED_PAYMENT_ICON_FORMATS = '.gif, .jpeg, .jpg, .png, .ico, .svg, image/gif, image/jpeg, image/png, image/x-icon, image/svg+xml';
