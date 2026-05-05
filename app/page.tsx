"use client";

import { useEffect, useState, Suspense } from "react";
import { ref, onValue, push, serverTimestamp } from "firebase/database";
import { db } from "@/lib/firebase";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

// 1. Updated Interface to include imageUrl
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

// Sub-component to handle SearchParams (Required by Next.js for build optimization)
function MenuContent() {
  const [menu, setMenu] = useState<MenuData | null>(null);
  const [loading, setLoading] = useState(true);
  
  // 2. Automatically get the table number from the URL (?table=X)
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
    const newOrder = {
      itemName: item.name,
      price: item.price,
      status: "pending",
      table: `Table ${tableId}`, // 3. Dynamic table ID used here
      createdAt: serverTimestamp(),
    };

    push(ordersRef, newOrder)
      .then(() => alert(`${item.name} added to order for Table ${tableId}!`))
      .catch((error) => console.error("Order failed:", error));
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center">Loading Menu...</div>;

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-black font-sans">
      <header className="sticky top-0 z-10 bg-white/80 p-6 backdrop-blur-md dark:bg-black/80 border-b border-zinc-200 dark:border-zinc-800 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Table {tableId}</h1>
        <p className="text-sm text-zinc-500">Scan to Order & Enjoy</p>
      </header>

      <main className="flex-1 w-full max-w-xl mx-auto py-8 px-6 space-y-10">
        {menu && Object.entries(menu).map(([category, items]) => (
          <section key={category}>
            <h2 className="text-xl font-bold mb-4 border-l-4 border-orange-500 pl-3 uppercase tracking-wider">
              {category}
            </h2>
            <div className="grid gap-4">
              {Object.entries(items).map(([id, item]) => (
                <div key={id} className="flex bg-white p-4 rounded-2xl shadow-sm border border-zinc-100 dark:bg-zinc-900 dark:border-zinc-800">
                  
                  {/* 4. Image Display logic */}
                  {item.imageUrl && (
                    <img 
                      src={item.imageUrl} 
                      alt={item.name} 
                      className="w-24 h-24 object-cover rounded-xl mr-4"
                    />
                  )}

                  <div className="flex-1 pr-4">
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    <p className="text-sm text-zinc-500 line-clamp-2 mt-1">{item.description}</p>
                    <p className="text-orange-600 font-bold mt-2">${item.price}</p>
                  </div>
                  <button
                    onClick={() => handleOrder(item)}
                    className="self-center bg-black text-white px-5 py-2 rounded-full text-sm font-medium dark:bg-white dark:text-black"
                  >
                    Add +
                  </button>
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>

      {/* 5. Floating Scan Button */}
      <div className="fixed bottom-6 right-6">
        <Link href="/scan">
          <button className="bg-orange-600 text-white p-4 rounded-full shadow-lg hover:bg-orange-700 transition-transform active:scale-95">
            📷 Scan QR
          </button>
        </Link>
      </div>

      <footer className="p-8 text-center text-zinc-400 text-xs">
        <p>© 2026 w3xplorers Bangladesh Restaurant System</p>
      </footer>
    </div>
  );
}

// Final wrapper to handle Next.js Suspense requirements
export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MenuContent />
    </Suspense>
  );
}