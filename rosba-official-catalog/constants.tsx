
import { Product, Category } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  { 
    id: 'sample-1', 
    name: 'Kitab Fathul Qorib (Contoh)', 
    category: Category.FIQH, 
    description: 'Ini adalah contoh produk. Silakan gunakan fitur Upload Massal untuk menambahkan kitab Anda sendiri secara otomatis.', 
    price: 45000, 
    wholesalePrice: 38000, 
    minWholesale: 10, 
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop', 
    rating: 5.0 
  }
];
