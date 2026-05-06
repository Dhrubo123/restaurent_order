"use client";

import { useEffect, useState, Suspense } from "react";
import { ref, onValue, push, serverTimestamp } from "firebase/database";
import { db } from "@/lib/firebase";
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
  const [showMenu, setShowMenu] = useState(false); // Controls the transition
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
    push(ordersRef, {
      itemName: item.name,
      price: item.price,
      status: "pending",
      table: `Table ${tableId}`,
      createdAt: serverTimestamp(),
    });
    setCart((prev) => [...prev, item]);
  };

  // 1. LOADING STATE
  if (loading) return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-[#faf9f6] space-y-4">
      <div className="w-12 h-12 border-4 border-amber-800/20 border-t-amber-800 rounded-full animate-spin" />
      <p className="font-serif italic text-amber-900/40 text-sm tracking-widest">Preparing Clique Menu...</p>
    </div>
  );

  // 2. SPLASH SCREEN (Shows immediately after loading)
  if (!showMenu) {
    return (
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center min-h-screen bg-[#1a1a1a] text-[#fdfcf0] p-8 text-center font-serif"
      >
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8 opacity-90"
        >
          <div className="text-[10px] tracking-[0.5em] uppercase mb-4 text-amber-200/40 font-sans">Since 2026</div>
          <h1 className="text-7xl font-light tracking-tighter italic">Clique</h1>
          <div className="text-2xl tracking-[0.3em] font-light mt-[-10px] text-amber-500">CAFE</div>
        </motion.div>
        
        <div className="h-[1px] w-16 bg-amber-900/50 mb-10" />

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-amber-100/60 mb-16 max-w-xs leading-relaxed font-sans text-[11px] tracking-[0.1em] uppercase"
        >
          Welcome to your sanctuary. <br /> You are seated at <span className="text-amber-500 font-bold">Table {tableId}</span>
        </motion.p>

        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowMenu(true)}
          className="px-14 py-5 border border-amber-500/30 text-amber-500 font-sans tracking-[0.3em] text-[10px] font-bold hover:bg-amber-500 hover:text-black transition-all duration-700"
        >
          EXPLORE THE MENU
        </motion.button>

        <footer className="absolute bottom-10 text-[8px] tracking-[0.4em] uppercase opacity-20 font-sans">
          Boutique Experience • w3xplorers Bangladesh
        </footer>
      </motion.div>
    );
  }

  // 3. MAIN MENU UI (Shows only after clicking Explore)
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      className="bg-[#faf9f6] min-h-screen text-[#2d241e] font-sans pb-32"
    >
      {/* --- Rest of your existing menu code (Floating Cart, Main Header, Categories, etc.) --- */}
      {/* ... (Paste your Floating Cart and Main UI code here) ... */}
    </motion.div>
  );
}

// --- 3. MAIN PAGE EXPORT ---
export default function Home() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#faf9f6]">
        <p className="font-serif italic text-amber-900/40">Loading...</p>
      </div>
    }>
      <MenuContent />
    </Suspense>
  );
}