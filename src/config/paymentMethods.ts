export interface PaymentMethodConfig {
  id: string;
  title: string;
  subtitle: string;
  address?: string;
  phone?: string;
  mapUrl: string;
  icon: string;
}

export const PAYMENT_METHODS: PaymentMethodConfig[] = [
  {
    id: 'd17',
    title: 'D17 Poste Mobile',
    subtitle: 'Application D17 (La Poste Tunisienne)',
    phone: '20 729 823',
    icon: 'smartphone',
    mapUrl: ''
  },
  {
    id: 'rib',
    title: 'Virement RIB',
    subtitle: 'Banque BIAT : 08 043 0001928372615 42',
    icon: 'building-bank',
    mapUrl: ''
  },
  {
    id: 'cash_mornag',
    title: 'Paiement direct en espèces à Mornag',
    subtitle: 'Morneg Centre',
    phone: '98 538 398',
    mapUrl: 'https://maps.google.com/?q=Morneg+Centre',
    icon: 'map-pin'
  },
  {
    id: 'cash_mourouj',
    title: 'Paiement direct en espèces à Mourouj',
    subtitle: '2 rue de Tunis, El Mourouj',
    phone: '20 881 122',
    mapUrl: 'https://maps.google.com/?q=El+Mourouj',
    icon: 'map-pin'
  }
];

export default PAYMENT_METHODS;
