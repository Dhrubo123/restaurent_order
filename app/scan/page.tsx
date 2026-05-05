"use client";
import { useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useRouter } from "next/navigation";

export default function ScanPage() {
  const router = useRouter();

  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", { 
      fps: 10, 
      qrbox: { width: 250, height: 250 } 
    }, false);

    scanner.render((decodedText) => {
      scanner.clear();
      // This takes the customer to the menu page with the table number
      router.push(decodedText); 
    }, (error) => {
      console.warn(error);
    });

    return () => scanner.clear();
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6">
      <h1 className="text-2xl font-bold mb-8">Scan Table QR</h1>
      <div id="reader" className="w-full max-w-sm overflow-hidden rounded-3xl border-2 border-orange-500"></div>
      <button 
        onClick={() => router.back()}
        className="mt-10 text-zinc-400 underline"
      >
        Go Back to Menu
      </button>
    </div>
  );
}