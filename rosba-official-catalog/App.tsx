
import React, { useState, useRef, useEffect } from 'react';
import { Product, Category } from './types';
import { INITIAL_PRODUCTS } from './constants';
import { analyzeKitabImage } from './geminiService';

const INSTAGRAM_URL = 'https://www.instagram.com/rosbastore_kitab?igsh=MXQyZjVxN2tnMnphMg==';
const WHATSAPP_NUMBER = '6285801102948';

const FloatingWA: React.FC = () => (
  <a 
    href={`https://wa.me/${WHATSAPP_NUMBER}?text=Assalamu'alaikum Rosba Store, saya ingin bertanya tentang stok kitab.`} 
    target="_blank" 
    rel="noopener noreferrer"
    className="fixed bottom-6 right-6 z-[60] bg-[#25D366] text-white w-14 h-14 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform hover:shadow-emerald-500/50 group"
    aria-label="Chat via WhatsApp"
  >
    <div className="absolute inset-0 bg-[#25D366] rounded-full animate-ping opacity-20 group-hover:hidden"></div>
    <i className="fa-brands fa-whatsapp text-3xl relative z-10"></i>
  </a>
);

const ProductModal: React.FC<{ product: Product | null; onClose: () => void }> = ({ product, onClose }) => {
  if (!product) return null;
  
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-md transition-all animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-5xl md:rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row relative max-h-[90vh]">
        <button onClick={onClose} className="absolute top-4 right-4 z-[110] w-10 h-10 rounded-full bg-slate-100 text-slate-900 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all">
          <i className="fa-solid fa-xmark"></i>
        </button>
        
        <div className="md:w-1/2 bg-slate-50 flex items-center justify-center p-6 md:p-10 border-b md:border-b-0 md:border-r border-slate-100">
          <img 
            src={product.image} 
            alt={product.name} 
            className="max-w-full max-h-[300px] md:max-h-full object-contain rounded-xl shadow-lg"
          />
        </div>
        
        <div className="md:w-1/2 p-6 md:p-12 overflow-y-auto">
          <div className="mb-6">
            <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest mb-2 inline-block">{product.category}</span>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight">{product.name}</h2>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Eceran</span>
              <div className="text-xl font-black text-slate-900">Rp {product.price.toLocaleString('id-ID')}</div>
            </div>
            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
              <span className="text-[10px] font-bold text-emerald-600 uppercase">Grosir</span>
              <div className="text-xl font-black text-emerald-600">Rp {product.wholesalePrice.toLocaleString('id-ID')}</div>
              <p className="text-[8px] font-bold text-emerald-500 mt-1">MIN {product.minWholesale} PCS</p>
            </div>
          </div>

          <div className="mb-10">
            <h4 className="text-slate-900 font-black mb-3 uppercase tracking-widest text-[10px]">Informasi Kitab</h4>
            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{product.description}</p>
          </div>

          <a 
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=Assalamu'alaikum Rosba Store, saya berminat pesan: ${encodeURIComponent(product.name)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-emerald-600 text-white font-black py-4 rounded-xl flex items-center justify-center gap-3 hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20"
          >
            <i className="fa-brands fa-whatsapp text-xl"></i>
            PESAN SEKARANG via WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [filter, setFilter] = useState<Category>(Category.ALL);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const catalogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchTerm.length > 0 && catalogRef.current) {
      catalogRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [searchTerm]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsAnalyzing(true);
    setUploadProgress({ current: 0, total: files.length });

    const newUploadedProducts: Product[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadProgress(prev => ({ ...prev, current: i + 1 }));

      try {
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (event) => resolve((event.target?.result as string).split(',')[1]);
          reader.readAsDataURL(file);
        });

        const imageUrl = `data:image/jpeg;base64,${base64}`;
        const analysis = await analyzeKitabImage(base64);

        if (analysis) {
          newUploadedProducts.push({
            id: `${Date.now()}-${i}`,
            name: analysis.name || "Kitab Baru",
            category: analysis.category || "Lainnya",
            description: analysis.description || "Deskripsi otomatis berdasarkan foto.",
            price: analysis.price || 45000,
            wholesalePrice: analysis.wholesalePrice || 36000,
            minWholesale: 10,
            image: imageUrl,
            rating: 5.0
          });
        }
      } catch (err) {
        console.error("Error analyzing file:", file.name, err);
      }
    }

    if (newUploadedProducts.length > 0) {
      setProducts(prev => [...newUploadedProducts, ...prev]);
      if (catalogRef.current) {
        catalogRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }

    setIsAnalyzing(false);
    setUploadProgress({ current: 0, total: 0 });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const filteredProducts = products.filter(p => {
    const matchesCategory = filter === Category.ALL || p.category === filter;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <FloatingWA />
      <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      
      {/* Header */}
      <header className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=2000&auto=format&fit=crop" 
            className="w-full h-full object-cover brightness-[0.4]"
            alt="Kitab Background"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/90 via-emerald-900/60 to-slate-50"></div>
        </div>

        <nav className="absolute top-0 left-0 right-0 z-50 p-6 md:px-12">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
             <div className="flex items-center gap-2">
                <div className="flex flex-col">
                  <h1 className="text-white text-3xl font-black tracking-tighter leading-none bg-clip-text text-transparent bg-gradient-to-r from-white to-emerald-400">ROSBA STORE</h1>
                  <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mt-1">Toko Kitab Pesantren</p>
                </div>
             </div>
             <div className="flex items-center gap-4">
                <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="text-white hover:text-emerald-400 transition-all transform hover:scale-110">
                    <i className="fa-brands fa-instagram text-3xl"></i>
                </a>
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-emerald-600 text-white px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-xl disabled:opacity-50"
                    disabled={isAnalyzing}
                >
                    {isAnalyzing ? (
                        <span className="flex items-center gap-2"><i className="fa-solid fa-spinner animate-spin"></i> {uploadProgress.current}/{uploadProgress.total}</span>
                    ) : "Upload Massal"}
                </button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleFileUpload} />
             </div>
          </div>
        </nav>

        <div className="relative z-10 text-center px-6 max-w-4xl">
           <span className="text-emerald-400 font-black text-xs uppercase tracking-[0.5em] mb-4 block">Nganjuk, Jawa Timur</span>
           <h2 className="text-4xl md:text-7xl font-black text-white mb-4 leading-[1.1]">
              Pusat Kitab Pelajaran <br/> 
              <span className="text-emerald-400">Pesantren & Klasik</span>
           </h2>
           
           <div className="mb-8 max-w-2xl mx-auto">
             <p className="text-white/80 text-sm md:text-base font-light leading-relaxed tracking-wide italic">
               "Pusat penyediaan kitab pesantren dan kitab pelajaran santri, meliputi berbagai disiplin keilmuan Islam. Mendukung kebutuhan pesantren, madrasah, dan lembaga pendidikan dengan layanan eceran dan grosir."
             </p>
           </div>
           
           <div className="mb-10">
             <p className="text-red-500 font-black text-sm md:text-xl animate-blink">
               <i className="fa-solid fa-circle-info mr-2"></i>
               HARGA DAN STOK SILAKAN HUBUNGI ADMIN
             </p>
           </div>
           
           <div className="bg-white p-2 rounded-2xl shadow-2xl max-w-2xl mx-auto flex items-center border border-white/20">
                <i className="fa-solid fa-magnifying-glass ml-4 text-slate-400 text-xl"></i>
                <input 
                  type="text" 
                  placeholder="Cari judul kitab..." 
                  className="w-full bg-transparent border-none py-4 px-4 text-slate-900 focus:ring-0 text-lg font-medium"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
           </div>
        </div>
      </header>

      {/* Catalog */}
      <main ref={catalogRef} className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
           <h3 className="text-3xl font-black text-slate-900 flex items-center gap-3">
             <div className="w-2 h-10 bg-emerald-600 rounded-full"></div>
             KATALOG KITAB
           </h3>
           
           <div className="flex gap-2 overflow-x-auto pb-4 md:pb-0 no-scrollbar w-full md:w-auto">
              {Object.values(Category).map(cat => (
                <button 
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${filter === cat ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-600/20' : 'bg-white text-slate-500 border-slate-200 hover:border-emerald-300'}`}
                >
                  {cat}
                </button>
              ))}
           </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
           {filteredProducts.map(p => (
             <div 
               key={p.id} 
               onClick={() => setSelectedProduct(p)}
               className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-slate-100 cursor-pointer flex flex-col h-full"
             >
                <div className="relative aspect-[3/4] overflow-hidden">
                   <img src={p.image} alt={p.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                   <div className="absolute top-3 left-3 bg-emerald-600 text-white px-2 py-1 rounded-lg text-[8px] font-black uppercase">Ready</div>
                </div>
                <div className="p-4 flex flex-col flex-grow">
                   <span className="text-[10px] font-black text-emerald-600 uppercase mb-1">{p.category}</span>
                   <h4 className="font-bold text-slate-800 text-sm line-clamp-2 mb-4">{p.name}</h4>
                   <div className="mt-auto">
                      <div className="text-lg font-black text-slate-900">Rp {p.price.toLocaleString('id-ID')}</div>
                      <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Grosir Tersedia</span>
                   </div>
                </div>
             </div>
           ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-20">
             <p className="text-slate-400 font-bold">Kitab tidak ditemukan.</p>
          </div>
        )}
      </main>

      <footer className="bg-slate-900 text-white py-20 px-6">
         <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
            <div>
               <div className="mb-6">
                  <h4 className="text-white text-2xl font-black tracking-tighter leading-none">ROSBA STORE</h4>
                  <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mt-1">Nganjuk, Jawa Timur</p>
               </div>
               <p className="text-slate-400 text-sm leading-relaxed">
                  Pusat Literasi Pesantren terpercaya di Nganjuk. Melayani pengiriman ke seluruh Nusantara.
               </p>
            </div>
            <div>
               <h4 className="font-black text-sm uppercase tracking-widest mb-6 text-emerald-500">Hubungi Kami</h4>
               <ul className="space-y-3 text-slate-400 text-sm">
                  <li><i className="fa-brands fa-whatsapp mr-2 text-emerald-500"></i> +62 858-0110-2948</li>
                  <li><i className="fa-solid fa-location-dot mr-2 text-emerald-500"></i> Nganjuk, Jawa Timur</li>
               </ul>
            </div>
            <div>
                <h4 className="font-black text-sm uppercase tracking-widest mb-6 text-emerald-500">Sosial Media</h4>
                <div className="flex justify-center md:justify-start gap-4">
                    <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center hover:bg-emerald-600 transition-colors">
                        <i className="fa-brands fa-instagram text-xl"></i>
                    </a>
                </div>
            </div>
         </div>
      </footer>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .animate-blink { animation: blink 1s infinite; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default App;
