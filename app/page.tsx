"use client";

import { useEffect, useState, Suspense } from "react";
import { ref, onValue, push, serverTimestamp } from "firebase/database";
import { db } from "@/lib/firebase"; // Database connection for w3xplorers projects
import { useSearchParams } from "next/navigation";
import { CldImage } from 'next-cloudinary';
import { motion, AnimatePresence } from "framer-motion";

// --- 1. INTERFACES ---
interface MenuItem {
  name: string;
  price: number;
  description: string;
  imageUrl?: string; 
}

interface MenuData {
  [category: string]: {
    [itemId: string]: MenuItem;
  };
}

// --- 2. MENU CONTENT COMPONENT ---
function MenuContent() {
  const [menu, setMenu] = useState<MenuData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false); 
  const [cart, setCart] = useState<MenuItem[]>([]); 
  
  const searchParams = useSearchParams();
  const tableId = searchParams.get("table") || "Walk-in";

  useEffect(() => {
    const menuRef = ref(db, "menu");
    const unsubscribe = onValue(menuRef, (snapshot) => {
      if (snapshot.exists()) {
        setMenu(snapshot.val());
      }
      setLoading(false);
    }, (error) => {
      console.error("Firebase Error:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const addToCart = (item: MenuItem) => {
    const ordersRef = ref(db, "orders");
    
    // Direct push to Firebase for real-time manager notification
    push(ordersRef, {
      itemName: item.name,
      price: item.price,
      status: "pending",
      table: `Table ${tableId}`,
      createdAt: serverTimestamp(),
    });
    
    setCart((prev) => [...prev, item]);
  };

  if (loading) return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-[#faf9f6]">
      <div className="w-12 h-12 border-4 border-amber-800/20 border-t-amber-800 rounded-full animate-spin" />
    </div>
  );

  // --- SPLASH SCREEN ---
  if (!showMenu) {
    return (
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center min-h-screen bg-[#1a1a1a] text-[#fdfcf0] p-8 text-center"
      >
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          {/* Logo reference: clique.jpg */}
          <img src="/logo.png" alt="Clique Cafe Logo" className="w-64 h-64 object-contain shadow-2xl rounded-full" />
        </motion.div>
        
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            <p className="text-amber-100/40 mb-12 font-sans text-[11px] tracking-[0.3em] uppercase">
              Table {tableId}
            </p>
            <button 
              onClick={() => setShowMenu(true)}
              className="px-14 py-5 border border-amber-500/30 text-amber-500 font-sans tracking-[0.3em] text-[10px] font-bold hover:bg-amber-500 hover:text-black transition-all duration-700 active:scale-95"
            >
              EXPLORE THE MENU
            </button>
        </motion.div>

        <footer className="absolute bottom-10 text-[8px] tracking-[0.4em] uppercase opacity-20 font-sans">
          Boutique Experience • w3xplorers Bangladesh
        </footer>
      </motion.div>
    );
  }

  // --- MAIN MENU UI ---
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="bg-[#faf9f6] min-h-screen text-[#2d241e] font-sans pb-32"
    >
      <AnimatePresence>
        {cart.length > 0 && (
          <motion.div 
            initial={{ y: 100, x: "-50%" }} animate={{ y: 0, x: "-50%" }} exit={{ y: 100, x: "-50%" }}
            className="fixed bottom-8 left-1/2 z-50 w-[90%] max-w-md"
          >
            <div className="bg-[#2d241e] text-[#faf9f6] p-4 rounded-2xl flex justify-between items-center shadow-2xl border border-white/10">
               <div className="ml-2">
                 <span className="block text-[10px] opacity-40 uppercase tracking-widest">Cart Status</span>
                 <span className="text-xs font-bold uppercase tracking-widest">{cart.length} Items Added</span>
               </div>
               <button className="bg-amber-600 px-6 py-3 rounded-xl text-[10px] font-black tracking-widest hover:bg-amber-700 transition-colors">
                 VIEW ORDER
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-2xl mx-auto py-12 px-6">
        <header className="flex flex-col items-center mb-20">
          <img src="/clique.jpg" alt="Clique Cafe Logo" className="w-24 h-24 mb-4" />
          <div className="flex items-center gap-4">
            <div className="h-[1px] w-8 bg-amber-800/20" />
            <p className="text-[10px] uppercase tracking-[0.5em] text-amber-800 font-bold tracking-widest">Menu</p>
            <div className="h-[1px] w-8 bg-amber-800/20" />
          </div>
        </header>

        {menu && Object.keys(menu).length > 0 ? (
          Object.entries(menu).map(([category, items]) => (
            <section key={category} className="mb-20">
              <h2 className="text-[11px] uppercase tracking-[0.4em] text-amber-800/60 mb-12 text-center">— {category} —</h2>
              <div className="space-y-14">
                {Object.entries(items).map(([id, item]) => (
                  <motion.div 
                    layout 
                    key={id} 
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex gap-6 items-start group"
                  >
                    <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0">
                      {item.imageUrl && (
                        <>
                          {/* Logic to handle external Unsplash URLs vs Cloudinary IDs */}
                          {item.imageUrl.startsWith("http") ? (
                            <img 
                              src={item.imageUrl} 
                              alt={item.name} 
                              className="rounded-3xl w-full h-full object-cover shadow-sm grayscale-[20%] group-hover:grayscale-0 transition-all duration-500" 
                            />
                          ) : (
                            <CldImage 
                              width="128" 
                              height="128" 
                              src={item.imageUrl} 
                              alt={item.name} 
                              crop="fill" 
                              className="rounded-3xl object-cover shadow-sm grayscale-[20%] group-hover:grayscale-0 transition-all duration-500" 
                            />
                          )}
                        </>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-baseline mb-1">
                        <h3 className="text-lg font-serif italic text-[#1a1a1a]">{item.name}</h3>
                        <p className="font-bold text-amber-900 text-sm">৳{item.price}</p>
                      </div>
                      <p className="text-xs text-[#8c7e6d] leading-relaxed mb-4 line-clamp-2">{item.description}</p>
                      <button 
                        onClick={() => addToCart(item)} 
                        className="text-[10px] uppercase tracking-widest font-black text-amber-800 border-b-2 border-amber-800/10 hover:border-amber-800 transition-all pb-1"
                      >
                        + Add to Order
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          ))
        ) : (
          <div className="text-center py-20 opacity-30 italic font-serif">
            Our boutique menu is currently being updated...
          </div>
        )}
      </main>

      <footer className="py-20 text-center opacity-10 text-[9px] uppercase tracking-[0.4em] font-bold">
        © 2026 Clique Cafe • Powered by w3xplorers Bangladesh
      </footer>
    </motion.div>
  );
}

// --- 3. MAIN PAGE EXPORT ---
export default function Home() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#faf9f6]">
        <p className="font-serif italic text-amber-900/40">Loading sanctuary...</p>
      </div>
    }>
      <MenuContent />
    </Suspense>
  );
}