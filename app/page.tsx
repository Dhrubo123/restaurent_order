"use client";

import { useEffect, useState, Suspense } from "react";
import { ref, onValue, push, serverTimestamp } from "firebase/database";
import { db } from "@/lib/firebase";
import { useSearchParams } from "next/navigation";
import { CldImage } from 'next-cloudinary';

// Interfaces remain the same
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

function MenuContent() {
  const [menu, setMenu] = useState<MenuData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false); 
  
  const searchParams = useSearchParams();
  const tableId = searchParams.get("table") || "Walk-in";

  useEffect(() => {
    const menuRef = ref(db, "menu");
    const unsubscribe = onValue(menuRef, (snapshot) => {
      if (snapshot.exists()) {
        setMenu(snapshot.val());
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleOrder = (item: MenuItem) => {
    const ordersRef = ref(db, "orders");
    push(ordersRef, {
      itemName: item.name,
      price: item.price,
      status: "pending",
      table: `Table ${tableId}`,
      createdAt: serverTimestamp(),
    }).then(() => alert(`Added ${item.name} to your order.`));
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-[#faf9f6] text-[#4a3f35]">Loading Clique Cafe...</div>;

  // --- CLIQUE CAFE SPLASH SCREEN ---
  if (!showMenu) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#1a1a1a] text-[#fdfcf0] p-8 text-center font-serif">
        <div className="mb-8 opacity-90">
          <div className="text-sm tracking-[0.4em] uppercase mb-2 text-amber-200/60">Established 2026</div>
          <h1 className="text-6xl font-light tracking-tighter italic">Clique</h1>
          <div className="text-2xl tracking-[0.2em] font-light mt-[-10px] text-amber-500">CAFE</div>
        </div>
        
        <div className="h-[1px] w-24 bg-amber-900/50 mb-8" />

        <p className="text-amber-100/70 mb-12 max-w-xs leading-relaxed font-sans text-sm tracking-wide">
          Welcome to your sanctuary. <br /> You are at <strong>Table {tableId}</strong>
        </p>

        <button 
          onClick={() => setShowMenu(true)}
          className="group relative px-12 py-4 border border-amber-500/30 text-amber-500 font-sans tracking-[0.2em] text-xs hover:bg-amber-500 hover:text-black transition-all duration-500"
        >
          EXPLORE THE MENU
        </button>

        <footer className="absolute bottom-10 text-[9px] tracking-[0.3em] uppercase opacity-30 font-sans">
          Powered by w3xplorers Bangladesh
        </footer>
      </div>
    );
  }

  // --- CLIQUE CAFE MENU UI ---
  return (
    <div className="flex flex-col min-h-screen bg-[#faf9f6] text-[#2d241e] font-sans">
      <header className="sticky top-0 z-10 bg-[#faf9f6]/90 backdrop-blur-md p-8 border-b border-[#e5e1da] text-center">
        <h1 className="text-3xl font-serif italic tracking-tight">Clique Cafe</h1>
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#8c7e6d] mt-1">Table {tableId}</p>
      </header>

      <main className="flex-1 w-full max-w-2xl mx-auto py-12 px-6 space-y-16">
        {menu && Object.entries(menu).map(([category, items]) => (
          <section key={category}>
            <h2 className="text-sm uppercase tracking-[0.4em] text-amber-800 mb-8 text-center border-b border-amber-800/10 pb-4">
              {category}
            </h2>
            <div className="grid gap-10">
              {Object.entries(items).map(([id, item]) => (
                <div key={id} className="group flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6">
                  {item.imageUrl && (
                    <div className="w-32 h-32 flex-shrink-0 grayscale-[20%] group-hover:grayscale-0 transition-all duration-700">
                      {item.imageUrl.includes("cloudinary.com") ? (
                        <CldImage
                          width="128" height="128" src={item.imageUrl} alt={item.name}
                          crop="fill" className="rounded-full sm:rounded-2xl object-cover w-full h-full shadow-lg"
                        />
                      ) : (
                        <img src={item.imageUrl} alt={item.name} className="w-32 h-32 object-cover rounded-full sm:rounded-2xl shadow-lg" />
                      )}
                    </div>
                  )}

                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row justify-between items-center sm:items-baseline gap-2">
                      <h3 className="text-xl font-serif italic text-[#1a1a1a]">{item.name}</h3>
                      <div className="hidden sm:block flex-1 border-b border-dotted border-[#d1ccc4] mx-4" />
                      <p className="font-bold text-amber-900">৳{item.price}</p>
                    </div>
                    <p className="text-sm text-[#8c7e6d] mt-2 leading-relaxed max-w-md">{item.description}</p>
                    <button
                      onClick={() => handleOrder(item)}
                      className="mt-4 text-[10px] uppercase tracking-widest font-bold text-amber-700 hover:text-amber-900 transition-colors"
                    >
                      + Add to Order
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>

      <footer className="p-12 text-center text-[#d1ccc4] text-[9px] uppercase tracking-[0.3em]">
        © 2026 Clique Cafe • w3xplorers Bangladesh
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MenuContent />
    </Suspense>
  );
}