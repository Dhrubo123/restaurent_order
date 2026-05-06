"use client";

import { useEffect, useState, useRef } from "react";
import { db } from "@/lib/firebase";
import { ref, onValue, update, remove } from "firebase/database";

interface Order {
  id: string;
  itemName: string;
  price: number;
  table: string;
  status: "pending" | "served";
  createdAt: number;
}

export default function ManagerDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const lastOrderCount = useRef(0);

  useEffect(() => {
    const ordersRef = ref(db, "orders");
    const unsubscribe = onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const orderList = Object.entries(data).map(([id, value]: [string, any]) => ({
          id,
          ...value,
        })).sort((a, b) => b.createdAt - a.createdAt);

        if (orderList.length > lastOrderCount.current && lastOrderCount.current !== 0) {
          new Audio("/notification.mp3").play().catch(() => {});
        }

        lastOrderCount.current = orderList.length;
        setOrders(orderList);
      } else {
        setOrders([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const markServed = (id: string) => update(ref(db, `orders/${id}`), { status: "served" });
  const clearOrder = (id: string) => remove(ref(db, `orders/${id}`));

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-[#FDFCF0] text-[#4A3F35] font-serif italic">
      Opening the Station...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFCF0] text-[#2D241E] p-4 md:p-10 font-sans">
      {/* Header Section */}
      <header className="max-w-7xl mx-auto mb-12 flex flex-col md:flex-row justify-between items-center border-b border-[#E5E1DA] pb-8 gap-6">
        <div className="text-center md:text-left">
          <h1 className="text-[10px] uppercase tracking-[0.5em] text-[#BC6C25] font-bold mb-2">Clique Cafe Management</h1>
          <h2 className="text-4xl font-serif italic tracking-tight">Barista Dashboard</h2>
        </div>
        
        <div className="flex gap-4 items-center">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] uppercase tracking-widest text-[#8C7E6D]">Pending Orders</p>
            <p className="text-2xl font-serif text-[#BC6C25]">
              {orders.filter(o => o.status === 'pending').length}
            </p>
          </div>
          <button 
            onClick={() => new Audio("/notification.mp3").play()}
            className="bg-white border border-[#E5E1DA] p-3 rounded-full hover:bg-[#F5F2ED] transition-colors shadow-sm"
          >
            🔊
          </button>
        </div>
      </header>

      {/* Orders Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {orders.map((order) => (
          <div 
            key={order.id} 
            className={`relative flex flex-col p-6 rounded-2xl transition-all duration-500 ${
              order.status === 'pending' 
                ? 'bg-white border-l-8 border-[#BC6C25] shadow-[0_10px_30px_rgba(74,63,53,0.05)] ring-1 ring-black/5 scale-[1.02]' 
                : 'bg-[#F5F2ED] border-l-8 border-[#D1CCC4] opacity-50 grayscale-[50%]'
            }`}
          >
            <div className="flex justify-between items-start mb-6">
              <span className="px-3 py-1 bg-[#2D241E] text-[#FDFCF0] text-[10px] font-bold tracking-widest uppercase rounded-md">
                {order.table}
              </span>
              <span className="text-[10px] font-medium text-[#8C7E6D]">
                {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <h3 className="text-xl font-serif italic mb-1 text-[#1A1A1A]">{order.itemName}</h3>
            <p className="text-sm text-[#BC6C25] font-bold mb-6">৳{order.price}</p>

            <div className="mt-auto pt-4 flex gap-2">
              {order.status === 'pending' ? (
                <button 
                  onClick={() => markServed(order.id)}
                  className="flex-1 bg-[#4A3F35] text-white py-3 rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-[#2D241E] transition-all active:scale-95 shadow-md shadow-[#4a3f35]/20"
                >
                  Served
                </button>
              ) : (
                <button 
                  onClick={() => clearOrder(order.id)}
                  className="flex-1 border border-[#D1CCC4] text-[#8C7E6D] py-3 rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {orders.length === 0 && (
        <div className="max-w-md mx-auto mt-20 text-center py-16 px-6 border border-dashed border-[#D1CCC4] rounded-[40px]">
          <p className="text-[#8C7E6D] font-serif italic text-lg leading-relaxed">
            The counter is clear. <br /> Time for a coffee break?
          </p>
        </div>
      )}

      <footer className="mt-20 text-center text-[9px] uppercase tracking-[0.4em] text-[#D1CCC4] font-bold">
        Clique Cafe Operations Hub
      </footer>
    </div>
  );
}