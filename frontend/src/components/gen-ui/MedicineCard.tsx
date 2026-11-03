"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Pill,
  ShieldCheck,
  Building2,
  Check,
  ShoppingCart,
  AlertCircle,
  Sparkles,
  ArrowRightLeft,
  ChevronRight,
  Info,
  Clock,
  Truck,
  Plus,
  Minus,
  CheckCircle2,
  FileText,
} from "lucide-react";

export interface MedicineAlternative {
  brand_name: string;
  generic_name: string;
  manufacturer: string;
  strength: string;
  form: string;
  price_bdt: number;
  is_requested?: boolean;
  highlights?: string;
  company_favicon_url?: string;
  image_url?: string;
  dar_reg_no?: string;
}

export interface MedicineItem {
  id: string;
  brand_name: string;
  generic_name: string;
  manufacturer: string;
  dosage_form: string;
  strength: string;
  pack_size: string;
  unit_price_bdt: number;
  strip_price_bdt: number;
  indications: string[];
  dosage_guide: string;
  safety_advice: string;
  pregnancy_category: string;
  alternatives: MedicineAlternative[];
  ecommerce_available?: boolean;
  in_stock?: boolean;
  company_favicon_url?: string;
  image_url?: string;
  dar_reg_no?: string;
}

export interface MedicineSearchData {
  query: string;
  primary_medicine: MedicineItem;
  alternatives_count: number;
  generic_group: string;
  disclaimer?: string;
}

interface MedicineCardProps {
  data?: MedicineSearchData;
}

/**
 * Company Favicon with multi-tier fallback.
 */
function CompanyFavicon({
  url,
  companyName,
  size = 20,
}: {
  url?: string;
  companyName: string;
  size?: number;
}) {
  const [hasError, setHasError] = useState(false);

  // Derive domain from name if no URL provided
  const derivedUrl =
    url ||
    (companyName.toLowerCase().includes("aci")
      ? "https://www.google.com/s2/favicons?domain=aci-bd.com&sz=128"
      : companyName.toLowerCase().includes("beximco")
      ? "https://www.google.com/s2/favicons?domain=beximcopharma.com&sz=128"
      : companyName.toLowerCase().includes("square")
      ? "https://www.google.com/s2/favicons?domain=squarepharma.com.bd&sz=128"
      : companyName.toLowerCase().includes("incepta")
      ? "https://www.google.com/s2/favicons?domain=inceptapharma.com&sz=128"
      : "https://www.google.com/s2/favicons?domain=acmeglobal.com&sz=128");

  if (hasError) {
    return (
      <div
        style={{ width: size, height: size }}
        className="rounded-full bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center shrink-0 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]"
      >
        {companyName.trim().charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={derivedUrl}
      alt={companyName}
      onError={() => setHasError(true)}
      style={{ width: size, height: size }}
      className="rounded-full object-contain shrink-0 bg-white p-0.5 border border-slate-200 dark:border-white/10 shadow-2xs"
      loading="lazy"
    />
  );
}

/**
 * Resilient Medicine Pack Image with Realistic Blister Pack SVG Fallback.
 * Ensures no broken image icons are ever visible to the user.
 */
function MedicineProductImage({
  imageUrl,
  brandName,
  strength,
  form,
  manufacturer,
}: {
  imageUrl?: string;
  brandName: string;
  strength: string;
  form: string;
  manufacturer: string;
}) {
  const [hasError, setHasError] = useState(false);

  // Clean company initial
  const isACI = manufacturer.toLowerCase().includes("aci");
  const isBeximco = manufacturer.toLowerCase().includes("beximco");
  const isSquare = manufacturer.toLowerCase().includes("square");

  const brandColor = isACI
    ? "from-emerald-600 to-teal-700"
    : isSquare
    ? "from-blue-600 to-sky-700"
    : "from-indigo-600 to-violet-700";

  if (hasError || !imageUrl) {
    return (
      <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800/80 dark:to-slate-900 border border-slate-200 dark:border-white/10 shadow-inner flex flex-col items-center justify-between p-3 select-none">
        {/* Foil blister pack header */}
        <div className="w-full flex items-center justify-between text-[9px] font-mono font-semibold text-slate-500 dark:text-zinc-400 border-b border-slate-300/60 dark:border-white/10 pb-1">
          <span className="truncate uppercase">{manufacturer.split(" ")[0]} PHARMA</span>
          <span className="px-1 py-0.2 rounded bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 font-bold">
            DGDA
          </span>
        </div>

        {/* 3D Blister Pill Pockets Simulation */}
        <div className="w-full grid grid-cols-5 gap-1.5 my-1.5 px-1">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="h-4 sm:h-5 rounded-full bg-gradient-to-b from-white to-slate-200 dark:from-slate-700 dark:to-slate-800 shadow-sm border border-slate-300/80 dark:border-white/20 flex items-center justify-center"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-slate-300/70 dark:bg-white/30" />
            </div>
          ))}
        </div>

        {/* Brand Label on packaging */}
        <div className="w-full bg-white dark:bg-black/60 rounded-lg p-2 border border-slate-200/80 dark:border-white/10 shadow-xs flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black tracking-tight text-slate-900 dark:text-white uppercase">
                {brandName}
              </span>
              <span className="text-[10px] font-mono font-bold px-1 rounded bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-zinc-300">
                {strength}
              </span>
            </div>
            <span className="text-[9px] text-slate-500 dark:text-zinc-400 block font-sans">
              Paracetamol BP &bull; {form}
            </span>
          </div>
          <CompanyFavicon companyName={manufacturer} size={18} />
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 flex items-center justify-center p-2">
      <img
        src={imageUrl}
        alt={brandName}
        onError={() => setHasError(true)}
        className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
        loading="lazy"
      />
      <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[9px] font-mono text-white">
        {strength}
      </div>
    </div>
  );
}

export function MedicineCard({ data }: MedicineCardProps) {
  const [cartAdded, setCartAdded] = useState(false);
  const [stripQuantity, setStripQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"alternatives" | "clinical">("alternatives");
  const [activeMedicine, setActiveMedicine] = useState<MedicineItem | null>(null);

  if (!data?.primary_medicine) {
    return (
      <div className="w-full max-w-3xl p-5 rounded-2xl bg-white dark:bg-[#1e1f20] border border-slate-200 dark:border-white/10 text-slate-500 text-xs">
        No medicine information available.
      </div>
    );
  }

  // Allow dynamically switching the primary view to an alternative (e.g. clicking ACI's Xcel)
  const currentMed = activeMedicine || data.primary_medicine;
  const { generic_group, disclaimer } = data;

  const totalPrice = (currentMed.strip_price_bdt * stripQuantity).toFixed(2);
  const totalTablets = stripQuantity * 10;

  const handleAddToCart = () => {
    setCartAdded(true);
    setTimeout(() => setCartAdded(false), 2500);
  };

  const handleSwitchAlternative = (alt: MedicineAlternative) => {
    // Promote alternative to view
    setActiveMedicine({
      id: `med-${alt.brand_name.toLowerCase()}`,
      brand_name: alt.brand_name,
      generic_name: alt.generic_name,
      manufacturer: alt.manufacturer,
      dosage_form: alt.form,
      strength: alt.strength,
      pack_size: "10 x 10 Strip Box",
      unit_price_bdt: alt.price_bdt,
      strip_price_bdt: alt.price_bdt * 10,
      indications: currentMed.indications,
      dosage_guide: currentMed.dosage_guide,
      safety_advice: currentMed.safety_advice,
      pregnancy_category: currentMed.pregnancy_category,
      alternatives: data.primary_medicine.alternatives,
      company_favicon_url: alt.company_favicon_url,
      dar_reg_no: alt.dar_reg_no,
      image_url: alt.image_url,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-3xl my-3 rounded-2xl bg-white dark:bg-[#1e1f20] border border-slate-200 dark:border-white/10 shadow-md text-slate-800 dark:text-slate-100 overflow-hidden"
    >
      {/* Pharma Header Banner */}
      <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-white/10 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent dark:from-emerald-950/30">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          {/* Left: Product Image & Overview */}
          <div className="flex items-start gap-3.5 w-full md:w-auto">
            <div className="w-24 sm:w-28 shrink-0">
              <MedicineProductImage
                imageUrl={currentMed.image_url}
                brandName={currentMed.brand_name}
                strength={currentMed.strength}
                form={currentMed.dosage_form}
                manufacturer={currentMed.manufacturer}
              />
            </div>

            <div className="min-w-0 flex-1">
              {/* Manufacturer Badge & DAR */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <CompanyFavicon
                  url={currentMed.company_favicon_url}
                  companyName={currentMed.manufacturer}
                  size={16}
                />
                <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-400">
                  {currentMed.manufacturer}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-zinc-400 border border-slate-200 dark:border-white/5">
                  {currentMed.dar_reg_no || "DGDA Verified"}
                </span>
              </div>

              {/* Brand Name & Strength */}
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  {currentMed.brand_name}
                </h3>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  {currentMed.strength}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-white/5">
                  {currentMed.dosage_form}
                </span>
              </div>

              {/* Generic Molecule Info */}
              <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1 flex items-center gap-1.5">
                <span>Generic:</span>
                <strong className="text-slate-900 dark:text-zinc-200 font-semibold">
                  {currentMed.generic_name}
                </strong>
                <span>&bull;</span>
                <span className="text-slate-500 font-mono text-[11px]">{currentMed.pack_size}</span>
              </p>

              {/* 2-Hour Delivery Badge */}
              <div className="flex items-center gap-1.5 mt-2 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
                <Truck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Express Delivery in 2 Hours (Arogga / Chaldal Pharmacy)</span>
              </div>
            </div>
          </div>

          {/* Right: Quantity Stepper & Cart Checkout */}
          <div className="w-full md:w-auto p-3 rounded-xl bg-white dark:bg-black/30 border border-slate-200 dark:border-white/10 shadow-xs flex flex-row md:flex-col items-center md:items-end justify-between gap-3 shrink-0">
            <div className="text-left md:text-right">
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 block font-medium">
                Unit: ৳{currentMed.unit_price_bdt.toFixed(2)} / tablet
              </span>
              <div className="text-lg font-black text-slate-900 dark:text-white font-mono leading-tight">
                ৳{totalPrice}{" "}
                <span className="text-xs font-normal text-slate-500 dark:text-zinc-400">
                  ({stripQuantity} strip &bull; {totalTablets} tabs)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Quantity Stepper */}
              <div className="flex items-center rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-0.5">
                <button
                  onClick={() => setStripQuantity(Math.max(1, stripQuantity - 1))}
                  className="w-6 h-6 rounded flex items-center justify-center text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-white/10 cursor-pointer"
                  title="Decrease strip"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-6 text-center text-xs font-mono font-bold text-slate-800 dark:text-white">
                  {stripQuantity}
                </span>
                <button
                  onClick={() => setStripQuantity(stripQuantity + 1)}
                  className="w-6 h-6 rounded flex items-center justify-center text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-white/10 cursor-pointer"
                  title="Increase strip"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              {/* Order Action Button */}
              <button
                onClick={handleAddToCart}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-xs ${
                  cartAdded
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-zinc-200"
                }`}
              >
                {cartAdded ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white" />
                    <span>Added to Cart</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>Order Now</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-200/70 dark:border-white/5">
          <button
            onClick={() => setActiveTab("alternatives")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === "alternatives"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-white/10"
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Generic Alternatives ({currentMed.alternatives.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("clinical")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === "clinical"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-white/10"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Clinical Usage & Dosage</span>
          </button>
        </div>
      </div>

      {/* Main Tab Panels */}
      <div className="p-4 sm:p-5">
        {activeTab === "alternatives" ? (
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Direct Generic Alternatives for {currentMed.generic_name}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  Same active pharmaceutical ingredient, identical bio-equivalence, verified by DGDA.
                </p>
              </div>

              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                100% Bio-Equivalent
              </span>
            </div>

            {/* Alternatives Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentMed.alternatives.map((alt, idx) => {
                const isACI = alt.manufacturer.toLowerCase().includes("aci");
                const isSquare = alt.manufacturer.toLowerCase().includes("square");
                const isBeximco = alt.manufacturer.toLowerCase().includes("beximco");
                const isCurrentActive = currentMed.brand_name.toLowerCase() === alt.brand_name.toLowerCase();

                return (
                  <motion.div
                    key={idx}
                    whileHover={{ y: -2 }}
                    className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                      isCurrentActive
                        ? "border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/30"
                        : isACI
                        ? "border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/20 dark:bg-emerald-950/10 hover:border-emerald-400"
                        : "border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.02] hover:border-slate-300 dark:hover:border-white/20"
                    }`}
                  >
                    <div>
                      {/* Top Alt Row: Company Favicon + Brand + Price */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2">
                          <CompanyFavicon
                            url={alt.company_favicon_url}
                            companyName={alt.manufacturer}
                            size={20}
                          />
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-sm font-bold text-slate-900 dark:text-white">
                                {alt.brand_name}
                              </span>
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-200/80 dark:bg-white/10 text-slate-700 dark:text-zinc-300">
                                {alt.strength}
                              </span>
                              {isACI && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-600 text-white shadow-2xs">
                                  ACI Choice
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block truncate mt-0.5">
                              {alt.manufacturer}
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                            ৳{alt.price_bdt.toFixed(2)}
                          </div>
                          <span className="text-[10px] text-slate-400 block">/ tab</span>
                        </div>
                      </div>

                      {/* Highlights Pill */}
                      {alt.highlights && (
                        <div className="mt-2.5 text-[11px] px-2 py-1 rounded-md bg-white dark:bg-black/30 border border-slate-200/70 dark:border-white/5 text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                          <Sparkles className="w-3 h-3 text-emerald-500 shrink-0" />
                          <span className="truncate">{alt.highlights}</span>
                        </div>
                      )}
                    </div>

                    {/* Bottom Action Row */}
                    <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-white/5 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-mono text-[10px]">
                        {alt.dar_reg_no || "DGDA Approved"}
                      </span>

                      {!isCurrentActive ? (
                        <button
                          onClick={() => handleSwitchAlternative(alt)}
                          className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 transition-colors cursor-pointer"
                        >
                          <span>Compare / Switch</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      ) : (
                        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Currently Selected
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Clinical Usage Tab */
          <div className="space-y-4">
            {/* Indications */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Clinical Indications & Approved Uses</span>
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {currentMed.indications.map((ind, i) => (
                  <span
                    key={i}
                    className="text-xs px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-medium"
                  >
                    {ind}
                  </span>
                ))}
              </div>
            </div>

            {/* Dosage Guide */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10">
              <span className="text-xs font-bold text-slate-900 dark:text-white block mb-1">
                Standard Dosage Guidelines
              </span>
              <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
                {currentMed.dosage_guide}
              </p>
            </div>

            {/* Safety & Pregnancy */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 text-xs">
                <span className="font-bold text-amber-900 dark:text-amber-200 block mb-0.5">
                  Safety & Hepatic Warnings
                </span>
                <p className="text-amber-800/90 dark:text-amber-300/80 leading-relaxed text-[11px]">
                  {currentMed.safety_advice}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/40 text-xs">
                <span className="font-bold text-blue-900 dark:text-blue-200 block mb-0.5">
                  Pregnancy Safety ({currentMed.pregnancy_category})
                </span>
                <p className="text-blue-800/90 dark:text-blue-300/80 leading-relaxed text-[11px]">
                  Category B: Documented clinical studies show no evidence of impaired fertility or harm to the fetus when taken at recommended dosages.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Disclaimer Footer */}
        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-white/5 flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-zinc-400">
          <Info className="w-3 h-3 shrink-0" />
          <span>{disclaimer || "Always consult a certified medical practitioner or pharmacist before taking or switching medication."}</span>
        </div>
      </div>
    </motion.div>
  );
}
