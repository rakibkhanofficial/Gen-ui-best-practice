"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Star,
  MapPin,
  Wifi,
  Waves,
  Car,
  Utensils,
  Sparkles,
  Dumbbell,
  Users,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Coffee,
  Bed,
  CreditCard,
  Hotel as HotelIcon,
  Search,
  Globe2,
  SlidersHorizontal,
  Compass,
  ArrowRight,
  Check,
} from "lucide-react";
import confetti from "canvas-confetti";

export interface HotelRoomType {
  name: string;
  price_bdt: number;
  price_usd?: number;
  bed_type: string;
  capacity: string;
  features: string[];
}

export interface HotelItem {
  id: string;
  name: string;
  star_rating: number;
  category: string;
  location_area: string;
  address: string;
  rating: number;
  review_count: number;
  price_per_night_bdt: number;
  price_per_night_usd?: number;
  image_url: string;
  amenities: string[];
  featured_badge?: string;
  room_types: HotelRoomType[];
  check_in_time: string;
  check_out_time: string;
  booking_url: string;
  free_cancellation: boolean;
  distance_to_center_km?: number;
}

export interface HotelDestinationSuggestion {
  id: string;
  name: string;
  country: string;
  flag: string;
  tagline: string;
  image_url?: string;
  popular_stay?: string;
}

export interface HotelSearchData {
  query: string;
  location: string;
  check_in: string;
  check_out: string;
  guests: number;
  total_results: number;
  hotels: HotelItem[];
  price_range_summary: string;
  is_clarification_needed?: boolean;
  clarification_title?: string;
  clarification_message?: string;
  suggested_destinations?: HotelDestinationSuggestion[];
}

interface HotelBookingCardProps {
  data?: HotelSearchData;
  onSelectDestination?: (destQuery: string) => void;
}

/**
 * Resilient Hotel Image with Luxury Architectural Graphic Fallback.
 * Guarantees zero broken images if external CDN/photo fails.
 */
function HotelImageWithFallback({
  src,
  name,
  category,
}: {
  src: string;
  name: string;
  category: string;
}) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div className="relative aspect-[16/10] w-full bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col items-center justify-center p-4 text-center select-none overflow-hidden">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300 mb-2 shadow-inner">
          <HotelIcon className="w-6 h-6 text-amber-300" />
        </div>
        <span className="text-xs font-bold text-white line-clamp-1">{name}</span>
        <span className="text-[10px] text-amber-300/90 font-mono mt-0.5">{category}</span>
      </div>
    );
  }

  return (
    <div className="relative aspect-[16/10] w-full bg-slate-950 overflow-hidden">
      <img
        src={src}
        alt={name}
        onError={() => setHasError(true)}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
    </div>
  );
}

export function HotelBookingCard({ data, onSelectDestination }: HotelBookingCardProps) {
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [expandedHotelId, setExpandedHotelId] = useState<string | null>(null);
  const [bookedHotel, setBookedHotel] = useState<{ id: string; roomName: string; code: string } | null>(null);
  const [currency, setCurrency] = useState<"BDT" | "USD">("BDT");
  const [isChangingLocation, setIsChangingLocation] = useState(false);
  const [customLocationInput, setCustomLocationInput] = useState("");

  const isClarification = data?.is_clarification_needed || (!data?.hotels || data.hotels.length === 0);

  const handleBook = (hotelId: string, roomName: string) => {
    const randomCode = `HTL-${Math.floor(1000 + Math.random() * 9000)}-${Math.random().toString(36).substring(2, 4).toUpperCase()}`;
    setBookedHotel({ id: hotelId, roomName, code: randomCode });
    try {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch {}

    setTimeout(() => {
      setBookedHotel(null);
    }, 6000);
  };

  const toggleRooms = (id: string) => {
    setExpandedHotelId(expandedHotelId === id ? null : id);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const loc = customLocationInput.trim();
    if (!loc) return;
    if (onSelectDestination) {
      onSelectDestination(`Show me premier luxury hotels in ${loc}`);
    }
    setIsChangingLocation(false);
  };

  const handlePickSuggestion = (destName: string, country: string) => {
    if (onSelectDestination) {
      onSelectDestination(`Show me premier luxury hotels in ${destName}, ${country}`);
    }
  };

  const getAmenityIcon = (amenity: string) => {
    const a = amenity.toLowerCase();
    if (a.includes("wifi")) return <Wifi className="w-3 h-3 text-sky-500" />;
    if (a.includes("pool")) return <Waves className="w-3 h-3 text-blue-500" />;
    if (a.includes("airport") || a.includes("shuttle") || a.includes("transfer")) return <Car className="w-3 h-3 text-teal-500" />;
    if (a.includes("breakfast") || a.includes("dining") || a.includes("restaurant") || a.includes("michelin")) return <Coffee className="w-3 h-3 text-amber-500" />;
    if (a.includes("spa") || a.includes("jacuzzi") || a.includes("sauna")) return <Sparkles className="w-3 h-3 text-purple-500" />;
    if (a.includes("gym") || a.includes("fitness") || a.includes("workout")) return <Dumbbell className="w-3 h-3 text-rose-500" />;
    return <CheckCircle2 className="w-3 h-3 text-emerald-500" />;
  };

  // -------------------------------------------------------------------------
  // 1. Clarification & Human Approval / Destination Selector View
  // -------------------------------------------------------------------------
  if (isClarification) {
    const suggestions = data?.suggested_destinations || [];

    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-3xl my-3 rounded-2xl bg-white dark:bg-[#1e1f20] border border-slate-200 dark:border-white/10 shadow-lg text-slate-800 dark:text-slate-100 overflow-hidden"
      >
        {/* Destination Clarification Header */}
        <div className="p-5 border-b border-slate-200 dark:border-white/10 bg-gradient-to-r from-indigo-600/15 via-blue-600/10 to-amber-500/10 dark:from-indigo-950/40">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-600/25">
              <Compass className="w-6 h-6 animate-pulse" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  {data?.clarification_title || "Where would you like to stay?"}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  Interactive Selection
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1">
                {data?.clarification_message ||
                  "Specify any city, region, or country worldwide, or select one of the top curated destinations below."}
              </p>
            </div>
          </div>

          {/* Interactive Direct Custom Location Input */}
          <form onSubmit={handleSearchSubmit} className="mt-4 flex items-center gap-2">
            <div className="relative flex-1">
              <MapPin className="w-4 h-4 text-indigo-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={customLocationInput}
                onChange={(e) => setCustomLocationInput(e.target.value)}
                placeholder="Enter any city, region, or country (e.g. Paris, Tokyo, Cox's Bazar, Bali, New York)..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-black/40 border border-slate-200 dark:border-white/15 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-inner"
              />
            </div>
            <button
              type="submit"
              disabled={!customLocationInput.trim()}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm shadow-indigo-600/30 shrink-0"
            >
              <span>Explore Stays</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Curated / LLM Suggested Destination Cards */}
        <div className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
              <Globe2 className="w-3.5 h-3.5 text-indigo-500" />
              <span>Trending Global & Regional Destinations</span>
            </span>
            <span className="text-[11px] text-slate-400 font-mono">1-Click Quick Select</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {suggestions.map((dest) => (
              <motion.button
                key={dest.id}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handlePickSuggestion(dest.name, dest.country)}
                className="p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.03] hover:border-indigo-400 dark:hover:border-indigo-500/50 text-left transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-base">{dest.flag}</span>
                    <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 group-hover:underline">
                      Explore &rarr;
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                    {dest.name}, {dest.country}
                  </h4>
                  <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5 line-clamp-1">
                    {dest.tagline}
                  </p>
                </div>
                {dest.popular_stay && (
                  <div className="mt-2 pt-1.5 border-t border-slate-200/60 dark:border-white/5 text-[9px] font-mono text-slate-400 dark:text-zinc-500 truncate">
                    ★ {dest.popular_stay}
                  </div>
                )}
              </motion.button>
            ))}
          </div>

          {/* Quick Criteria Tags */}
          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-white/10 flex items-center gap-2 flex-wrap text-[11px] text-slate-500 dark:text-zinc-400">
            <span className="font-semibold text-slate-700 dark:text-zinc-300">Preferences Included:</span>
            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 font-mono">5-Star Luxury</span>
            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 font-mono">Free Breakfast</span>
            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 font-mono">Free Cancellation</span>
            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 font-mono">2 Guests / Suite</span>
          </div>
        </div>
      </motion.div>
    );
  }

  // -------------------------------------------------------------------------
  // 2. Full Hotel Results View
  // -------------------------------------------------------------------------
  const { location, check_in, check_out, guests, hotels, price_range_summary } = data;

  // Filter hotels
  const filteredHotels = hotels.filter((h) => {
    if (selectedFilter === "all") return true;
    if (selectedFilter === "luxury") return h.star_rating === 5;
    if (selectedFilter === "top_rated") return h.rating >= 4.8;
    if (selectedFilter === "airport") return h.location_area.toLowerCase().includes("airport");
    if (selectedFilter === "value") {
      const price = currency === "USD" ? (h.price_per_night_usd || h.price_per_night_bdt / 122) : h.price_per_night_bdt;
      return currency === "USD" ? price < 150 : price < 15000;
    }
    return true;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-3xl my-3 rounded-2xl bg-white dark:bg-[#1e1f20] border border-slate-200 dark:border-white/10 shadow-lg text-slate-800 dark:text-slate-100 overflow-hidden"
    >
      {/* Header Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-white/10 bg-gradient-to-r from-indigo-600/15 via-blue-600/10 to-amber-500/10 dark:from-indigo-950/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-indigo-600/30">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  Premier Hotels & Luxury Stays
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 uppercase">
                  Verified Rates
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span className="font-semibold text-slate-900 dark:text-white">{location}</span>
                <span>&bull;</span>
                <span className="text-slate-500">{check_in} – {check_out} ({guests} Guests)</span>
              </p>
            </div>
          </div>

          {/* Controls: Currency Switcher & Change Location */}
          <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
            {/* Currency Switcher */}
            <div className="flex items-center rounded-lg bg-slate-100 dark:bg-white/5 p-0.5 border border-slate-200 dark:border-white/10 text-[11px] font-mono font-bold">
              <button
                onClick={() => setCurrency("BDT")}
                className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                  currency === "BDT"
                    ? "bg-white dark:bg-black/60 text-indigo-600 dark:text-indigo-400 shadow-xs"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                ৳ BDT
              </button>
              <button
                onClick={() => setCurrency("USD")}
                className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                  currency === "USD"
                    ? "bg-white dark:bg-black/60 text-indigo-600 dark:text-indigo-400 shadow-xs"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                $ USD
              </button>
            </div>

            {/* Change Location Button */}
            <button
              onClick={() => setIsChangingLocation(!isChangingLocation)}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-white/10 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Search className="w-3 h-3 text-indigo-500" />
              <span>Change City</span>
            </button>
          </div>
        </div>

        {/* Change City Inline Input Drawer */}
        <AnimatePresence>
          {isChangingLocation && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleSearchSubmit}
              className="mt-3 pt-3 border-t border-slate-200 dark:border-white/10 flex items-center gap-2"
            >
              <div className="relative flex-1">
                <MapPin className="w-3.5 h-3.5 text-indigo-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={customLocationInput}
                  onChange={(e) => setCustomLocationInput(e.target.value)}
                  placeholder="Type any new city, region, or country (e.g. Tokyo, Paris, Bali, New York)..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white dark:bg-black/40 border border-slate-200 dark:border-white/15 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                disabled={!customLocationInput.trim()}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer shrink-0"
              >
                Search
              </button>
              <button
                type="button"
                onClick={() => setIsChangingLocation(false)}
                className="px-2 py-1.5 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                Cancel
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-200/70 dark:border-white/5 overflow-x-auto pb-1">
          {[
            { id: "all", label: `All Stays (${hotels.length})` },
            { id: "luxury", label: "5-Star Luxury" },
            { id: "top_rated", label: "Top Rated (4.8+)" },
            { id: "airport", label: "Airport Proximity" },
            { id: "value", label: currency === "USD" ? "Best Value (< $150)" : "Best Value (< ৳15k)" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedFilter(f.id)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors shrink-0 cursor-pointer ${
                selectedFilter === f.id
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-white/10"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Hotel Cards List */}
      <div className="p-4 sm:p-5 space-y-4">
        {filteredHotels.map((hotel) => {
          const isExpanded = expandedHotelId === hotel.id;
          const isBooked = bookedHotel?.id === hotel.id;
          const displayPrice =
            currency === "USD"
              ? `$${Math.round(hotel.price_per_night_usd || hotel.price_per_night_bdt / 122).toLocaleString()}`
              : `৳${Math.round(hotel.price_per_night_bdt).toLocaleString()}`;

          return (
            <motion.div
              key={hotel.id}
              whileHover={{ y: -2 }}
              className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.02] hover:border-indigo-400 dark:hover:border-indigo-500/40 transition-all overflow-hidden shadow-xs group"
            >
              <div className="flex flex-col md:flex-row">
                {/* Hotel Thumbnail Image */}
                <div className="relative md:w-64 shrink-0">
                  <HotelImageWithFallback
                    src={hotel.image_url}
                    name={hotel.name}
                    category={hotel.category}
                  />

                  {/* Star Rating Badge */}
                  <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-xs text-[11px] font-bold text-amber-400 border border-white/15 flex items-center gap-1">
                    {[...Array(hotel.star_rating)].map((_, i) => (
                      <Star key={i} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  {/* Featured Badge */}
                  {hotel.featured_badge && (
                    <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-indigo-600/90 text-white text-[10px] font-bold shadow-xs">
                      {hotel.featured_badge}
                    </div>
                  )}

                  {/* Free Cancellation Pill */}
                  {hotel.free_cancellation && (
                    <div className="absolute bottom-2 left-2.5 px-2 py-0.5 rounded bg-emerald-600/90 text-white text-[10px] font-medium flex items-center gap-1 shadow-xs">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Free Cancellation</span>
                    </div>
                  )}
                </div>

                {/* Hotel Details Section */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Title & Reviews Row */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1">
                      <div>
                        <h4 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                          {hotel.name}
                        </h4>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span className="truncate">{hotel.location_area}</span>
                          {hotel.distance_to_center_km && (
                            <>
                              <span>&bull;</span>
                              <span className="text-[11px] font-mono">{hotel.distance_to_center_km} km to center</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Review Score Badge */}
                      <div className="flex items-center gap-1.5 self-start sm:self-center shrink-0 mt-1 sm:mt-0">
                        <div className="text-right">
                          <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 block">
                            {hotel.rating >= 4.8 ? "Exceptional" : "Very Good"}
                          </span>
                          <span className="text-[10px] text-slate-400 block font-mono">
                            {hotel.review_count} reviews
                          </span>
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-mono font-bold text-xs flex items-center justify-center shadow-xs">
                          {hotel.rating}
                        </div>
                      </div>
                    </div>

                    {/* Amenities Grid */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {hotel.amenities.slice(0, 6).map((amenity, aIdx) => (
                        <span
                          key={aIdx}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-white dark:bg-black/30 text-slate-700 dark:text-zinc-300 border border-slate-200/80 dark:border-white/5 flex items-center gap-1 font-medium"
                        >
                          {getAmenityIcon(amenity)}
                          <span>{amenity}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Price & Action Row */}
                  <div className="mt-4 pt-3 border-t border-slate-200/70 dark:border-white/5 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-mono uppercase">Nightly Rate</span>
                      <div className="text-base sm:text-lg font-black font-mono text-slate-900 dark:text-white leading-tight">
                        {displayPrice}{" "}
                        <span className="text-xs font-normal text-slate-500">/ night</span>
                      </div>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-medium">
                        Taxes & breakfast options included
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleRooms(hotel.id)}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-xs font-medium text-slate-600 dark:text-zinc-300 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <span>Rooms ({hotel.room_types.length})</span>
                        {isExpanded ? (
                          <ChevronDown className="w-3 h-3" />
                        ) : (
                          <ChevronRight className="w-3 h-3" />
                        )}
                      </button>

                      <button
                        onClick={() => handleBook(hotel.id, hotel.room_types[0]?.name || "Standard Deluxe Room")}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-xs ${
                          isBooked
                            ? "bg-emerald-600 text-white"
                            : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20"
                        }`}
                      >
                        {isBooked ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                            <span>Reserved! ({bookedHotel.code})</span>
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Book Now</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Collapsible Room Types */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="p-4 bg-slate-100/60 dark:bg-black/30 border-t border-slate-200 dark:border-white/5 space-y-2.5"
                  >
                    <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
                      Available Room Categories
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {hotel.room_types.map((room, rIdx) => {
                        const roomPrice =
                          currency === "USD"
                            ? `$${Math.round(room.price_usd || room.price_bdt / 122).toLocaleString()}`
                            : `৳${Math.round(room.price_bdt).toLocaleString()}`;

                        return (
                          <div
                            key={rIdx}
                            className="p-3 rounded-xl bg-white dark:bg-[#202124] border border-slate-200/80 dark:border-white/10 text-xs flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex items-start justify-between gap-1 mb-1">
                                <h5 className="font-bold text-slate-900 dark:text-white">{room.name}</h5>
                                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                                  {roomPrice}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-zinc-400 mb-1.5">
                                <Bed className="w-3.5 h-3.5 text-slate-400" />
                                <span>{room.bed_type}</span>
                                <span>&bull;</span>
                                <span>{room.capacity}</span>
                              </div>

                              <div className="flex flex-wrap gap-1">
                                {room.features.map((feat, fIdx) => (
                                  <span
                                    key={fIdx}
                                    className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-zinc-300 font-mono"
                                  >
                                    {feat}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <button
                              onClick={() => handleBook(hotel.id, room.name)}
                              className="mt-2.5 w-full py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-[11px] font-semibold transition-colors cursor-pointer border border-indigo-200 dark:border-indigo-800 flex items-center justify-center gap-1"
                            >
                              <CreditCard className="w-3 h-3" />
                              <span>Reserve this Room</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
