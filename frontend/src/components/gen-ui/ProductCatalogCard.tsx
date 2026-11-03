"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Laptop,
  Star,
  Check,
  Cpu,
  ShoppingCart,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
} from "lucide-react";

interface ProductSpec {
  key: string;
  value: string;
  highlight?: boolean;
}

interface ProductItem {
  id: string;
  name: string;
  tagline: string;
  brand: string;
  category: string;
  price: number;
  currency: string;
  rating: number;
  review_count: number;
  image_url: string;
  badge?: string;
  specs: ProductSpec[];
  key_features: string[];
  in_stock: boolean;
}

interface ProductCatalogData {
  query?: string;
  total_found?: number;
  highlight_category?: string;
  products?: ProductItem[];
}

interface ProductCatalogProps {
  data?: ProductCatalogData;
  status?: "inProgress" | "executing" | "complete";
}

export function ProductCatalogCard({ data, status = "complete" }: ProductCatalogProps) {
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [cartState, setCartState] = useState<Record<string, boolean>>({});

  if (status === "inProgress" || !data?.products) {
    return (
      <div className="w-full max-w-3xl p-6 rounded-2xl glass-panel animate-pulse border border-slate-700/60 my-3">
        <div className="h-6 w-48 bg-slate-700 rounded-md mb-4" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-72 bg-slate-800 rounded-xl" />
          <div className="h-72 bg-slate-800 rounded-xl" />
        </div>
      </div>
    );
  }

  const handleAddToCart = (id: string) => {
    setCartState((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full max-w-3xl my-4 rounded-2xl glass-panel-elevated p-6 border border-slate-700/60 shadow-2xl relative overflow-hidden text-slate-100"
    >
      {/* Background glow */}
      <div className="absolute top-0 left-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-700/60 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <Laptop className="w-5 h-5 text-purple-400" />
              {data.highlight_category || "Product Comparison Matrix"}
            </h3>
            <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-purple-950/80 text-purple-300 border border-purple-800 font-medium">
              <Sparkles className="w-3 h-3" /> GenUI Commerce
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            AI-matched {data.products.length} models for query: &quot;{data.query}&quot;
          </p>
        </div>

        <div className="text-xs text-slate-400 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" /> Verified Tech Specs
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-5">
        {data.products.map((prod) => {
          const isAdded = cartState[prod.id];
          return (
            <div
              key={prod.id}
              className="flex flex-col justify-between bg-slate-900/70 hover:bg-slate-900/90 transition-all rounded-xl p-4 border border-slate-800 hover:border-slate-700 relative group"
            >
              {/* Badge if available */}
              {prod.badge && (
                <div className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-900/80 text-purple-200 border border-purple-700">
                  {prod.badge}
                </div>
              )}

              <div>
                <span className="text-[11px] font-semibold text-purple-400 uppercase tracking-wider">
                  {prod.brand}
                </span>
                <h4 className="text-base font-bold text-white mt-0.5">{prod.name}</h4>
                <p className="text-xs text-slate-400 mt-1 leading-snug">{prod.tagline}</p>

                {/* Rating */}
                <div className="flex items-center gap-2 my-2.5">
                  <div className="flex items-center text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span className="text-xs font-bold ml-1 text-white">{prod.rating}</span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    ({prod.review_count} reviews)
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-0.5">
                    <Zap className="w-3 h-3" /> In Stock
                  </span>
                </div>

                {/* Specs List */}
                <div className="space-y-1.5 my-3 p-3 bg-slate-950/60 rounded-lg border border-slate-800/80">
                  {prod.specs.map((spec, idx) => (
                    <div key={idx} className="flex justify-between text-xs">
                      <span className="text-slate-400 font-medium">{spec.key}</span>
                      <span
                        className={`text-right font-medium ${
                          spec.highlight ? "text-purple-300 font-semibold" : "text-slate-200"
                        }`}
                      >
                        {spec.value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Key Features Bullet Points */}
                <ul className="space-y-1 my-3 text-[11px] text-slate-300">
                  {prod.key_features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Price & Action */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between mt-2">
                <div>
                  <span className="text-[10px] text-slate-400 block">Starting at</span>
                  <span className="text-lg font-extrabold text-white">
                    ${prod.price.toLocaleString()}
                  </span>
                </div>

                <button
                  onClick={() => handleAddToCart(prod.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all shadow-sm ${
                    isAdded
                      ? "bg-emerald-600 text-white"
                      : "bg-purple-600 hover:bg-purple-500 text-white"
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Selected
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-3.5 h-3.5" /> Select Model
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

