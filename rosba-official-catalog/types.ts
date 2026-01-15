
export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  wholesalePrice: number;
  minWholesale: number;
  image: string;
  rating: number;
  discount?: number;
}

export enum Category {
  FIQH = 'Fiqh',
  HADITS = 'Hadits',
  TAFSIR = 'Tafsir',
  AQIDAH = 'Aqidah',
  NAHWU = 'Nahwu',
  SHOROF = 'Shorof',
  TASAWUF = 'Tasawuf',
  ADAB = 'Adab & Akhlaq',
  ALL = 'Semua'
}
