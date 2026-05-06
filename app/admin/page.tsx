"use client";

import { useState } from "react";
import { ref, push } from "firebase/database";
import { db } from "@/lib/firebase";

export default function AdminPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    category: "Burgers"
  });

  // Pulling configuration from your .env.local
  const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME; 
  const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Safety checks
    if (!file) return alert("Please select an image first!");
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      return alert("Cloudinary configuration missing in .env.local!");
    }

    setUploading(true);

    try {
      // 1. Prepare the file for Cloudinary Unsigned Upload
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", UPLOAD_PRESET);

      // 2. Upload to Cloudinary API using your cloud name: dzqfzodpr
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: "POST", body: data }
      );
      
      const fileData = await response.json();
      
      if (!fileData.secure_url) {
        throw new Error("Upload failed. Verify your preset is set to 'Unsigned'.");
      }

      const imageUrl = fileData.secure_url;

      // 3. Save the item data + Cloudinary URL to Firebase Realtime Database
      const categoryRef = ref(db, `menu/${formData.category}`);
      await push(categoryRef, {
        name: formData.name,
        price: parseFloat(formData.price),
        description: formData.description,
        imageUrl: imageUrl, 
        createdAt: new Date().toISOString()
      });

      alert("Menu item added successfully!");
      
      // Reset form for the next entry
      setFile(null);
      setFormData({ name: "", price: "", description: "", category: "Burgers" });
      
    } catch (error) {
      console.error("Error adding item:", error);
      alert("Something went wrong. Check the browser console for details.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-8 bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl mt-10 border border-zinc-200 dark:border-zinc-800 font-sans">
      <h1 className="text-2xl font-bold mb-6 text-zinc-900 dark:text-zinc-100">Add New Menu Item</h1>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1">Item Name</label>
          <input 
            type="text" required placeholder="e.g. Double Cheese Burger"
            className="w-full p-3 rounded-xl border dark:bg-black dark:border-zinc-700 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
            value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Price (৳)</label>
          <input 
            type="number" required placeholder="Price in BDT"
            className="w-full p-3 rounded-xl border dark:bg-black dark:border-zinc-700 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
            value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Food Image</label>
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-300 dark:border-zinc-700 p-6 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
            <input 
              type="file" accept="image/*" required
              onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
              className="text-xs text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-100 file:text-orange-700 hover:file:bg-orange-200 cursor-pointer"
            />
            {file && <p className="mt-2 text-xs text-green-600 font-medium italic">✓ {file.name} selected</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select 
            className="w-full p-3 rounded-xl border dark:bg-black dark:border-zinc-700 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
            value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}
          >
            <option value="Burgers">Burgers</option>
            <option value="Pizzas">Pizzas</option>
            <option value="Drinks">Drinks</option>
            <option value="Nachos">Nachos</option>
            <option value="Meat Box">Meat Box</option>
            <option value="MOMO">MOMO</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea 
            placeholder="Describe the ingredients and taste..."
            className="w-full p-3 rounded-xl border dark:bg-black dark:border-zinc-700 focus:ring-2 focus:ring-orange-500 outline-none transition-all h-24 resize-none"
            value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
          />
        </div>

        <button 
          type="submit" disabled={uploading}
          className={`w-full p-4 rounded-xl font-bold text-white transition-all shadow-lg ${uploading ? 'bg-zinc-400 cursor-wait' : 'bg-orange-600 hover:bg-orange-700 active:scale-95 shadow-orange-500/20'}`}
        >
          {uploading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Uploading...
            </span>
          ) : "Add to Menu"}
        </button>
      </form>

      <footer className="mt-8 text-center text-[10px] text-zinc-400 uppercase tracking-widest">
        Developed by w3xplorers Bangladesh
      </footer>
    </div>
  );
}