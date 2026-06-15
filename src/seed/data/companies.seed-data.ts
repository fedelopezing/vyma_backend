export interface CompanySeedItem {
  name: string;
  taxId: string;
  email: string;
  isActive: boolean;
}

export const SEED_COMPANIES: CompanySeedItem[] = [
  {
    name: 'CCPS, Cámara de Comercio Paraguayo Suiza',
    taxId: '80001234-5',
    email: 'contacto@ccps.org.py',
    isActive: true,
  },
  {
    name: 'Biolimpieza SRL',
    taxId: '80054321-0',
    email: 'info@biolimpieza.com',
    isActive: true,
  },
  {
    name: 'NatyNails',
    taxId: '1234567-8',
    email: 'reservas@natynails.com',
    isActive: true,
  },
];
