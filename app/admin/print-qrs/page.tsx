"use client";

import { QRCodeSVG } from "qrcode.react";

export default function PrintQRs() {
  // Replace with your actual live domain
  const baseUrl = "https://your-restaurant-site.vercel.app";

  // Total tables
  const tableNumbers = Array.from({ length: 10 }, (_, i) => i + 1);

  return (
    <div className="p-10 bg-white min-h-screen font-sans text-black">
      {/* Print Notice */}
      <div className="mb-10 no-print bg-orange-100 p-4 rounded-xl text-orange-800">
        <p>
          <strong>Pro-Tip:</strong> Press <strong>Ctrl + P</strong> to print
          these QR cards.
        </p>
      </div>

      {/* QR Grid */}
      <div className="grid grid-cols-2 gap-10">
        {tableNumbers.map((num) => (
          <div
            key={num}
            className="border-2 border-zinc-200 p-8 flex flex-col items-center rounded-3xl"
          >
            <h2 className="text-3xl font-black mb-4">
              TABLE {num}
            </h2>

            <QRCodeSVG
              value={`${baseUrl}/?table=${num}`}
              size={180}
              level="H"
            />

            <p className="mt-4 text-zinc-400 text-xs italic">
              {baseUrl}/?table={num}
            </p>

            <p className="mt-2 font-bold text-orange-600">
              Scan to Order
            </p>
          </div>
        ))}
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none;
          }

          body {
            background: white;
          }
        }
      `}</style>
    </div>
  );
}