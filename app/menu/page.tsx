"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ref, onValue, push } from "firebase/database";
import { db } from "@/lib/firebase";

function MenuContent() {
  const [menu, setMenu] = useState<any>(null);
  const searchParams = useSearchParams();
  const table = searchParams.get("table") || "Walk-in";

  useEffect(() => {
    const menuRef = ref(db, "menu");
    return onValue(menuRef, (snapshot) => {
      setMenu(snapshot.val());
    });
  }, []);

  const placeOrder = (item: any) => {
    const ordersRef = ref(db, "orders");
    push(ordersRef, {
      ...item,
      table,
      status: "pending",
      timestamp: Date.now()
    }).then(() => alert("Order Sent!"));
  };

  if (!menu) return <div className="p-10 text-center">Loading Menu...</div>;

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen pb-20">
      <header className="p-6 bg-white shadow-sm sticky top-0 z-10">
        <h1 className="text-2xl font-bold">Table {table} Menu</h1>
      </header>

      <div className="p-4 space-y-8">
        {Object.entries(menu).map(([category, items]: [string, any]) => (
          <div key={category}>
            <h2 className="text-lg font-bold text-orange-600 mb-4 uppercase">{category}</h2>
            <div className="grid gap-4">
              {Object.entries(items).map(([id, item]: [string, any]) => (
                <div key={id} className="bg-white rounded-xl overflow-hidden shadow-sm flex border border-gray-100">
                  <img src={item.imageUrl} alt={item.name} className="w-24 h-24 object-cover" />
                  <div className="p-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-sm">{item.name}</h3>
                      <p className="text-xs text-gray-500 line-clamp-1">{item.description}</p>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="font-bold text-green-600">${item.price}</span>
                      <button 
                        onClick={() => placeOrder(item)}
                        className="bg-black text-white text-xs px-3 py-1.5 rounded-lg active:scale-95 transition"
                      >
                        Order
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MenuPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
      <MenuContent />
    </Suspense>
  );
}