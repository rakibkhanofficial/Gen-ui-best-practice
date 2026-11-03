"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building,
  Star,
  MapPin,
  Wifi,
  Waves,
  Car,
  Utensils,
  Sparkles,
  Dumbbell,
  Calendar,
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
} from "lucide-react";

export interface HotelRoomType {
  name: string;
  price_bdt: number;
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

export interface HotelSearchData {
  query: string;
  location: string;
  check_in: string;
  check_out: string;
  guests: number;
  total_results: number;
  hotels: HotelItem[];
  price_range_summary: string;
}

interface HotelBookingCardProps {
  data?: HotelSearchData;
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

export function HotelBookingCard({ data }: HotelBookingCardProps) {
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [expandedHotelId, setExpandedHotelId] = useState<string | null>(null);
  const [bookedHotel, setBookedHotel] = useState<{ id: string; roomName: string } | null>(null);

  if (!data?.hotels || data.hotels.length === 0) {
    return (
      <div className="w-full max-w-3xl p-5 rounded-2xl bg-white dark:bg-[#1e1f20] border border-slate-200 dark:border-white/10 text-slate-500 text-xs">
        No hotels available for this location.
      </div>
    );
  }

  const { location, check_in, check_out, guests, hotels, price_range_summary } = data;

  const handleBook = (hotelId: string, roomName: string) => {
    setBookedHotel({ id: hotelId, roomName });
    setTimeout(() => {
      setBookedHotel(null);
    }, 4000);
  };

  const toggleRooms = (id: string) => {
    setExpandedHotelId(expandedHotelId === id ? null : id);
  };

  // Filter hotels
  const filteredHotels = hotels.filter((h) => {
    if (selectedFilter === "all") return true;
    if (selectedFilter === "luxury") return h.star_rating === 5;
    if (selectedFilter === "airport") return h.location_area.toLowerCase().includes("airport");
    if (selectedFilter === "value") return h.price_per_night_bdt < 15000;
    return true;
  });

  const getAmenityIcon = (amenity: string) => {
    const a = amenity.toLowerCase();
    if (a.includes("wifi")) return <Wifi className="w-3 h-3 text-sky-500" />;
    if (a.includes("pool")) return <Waves className="w-3 h-3 text-blue-500" />;
    if (a.includes("airport") || a.includes("shuttle")) return <Car className="w-3 h-3 text-teal-500" />;
    if (a.includes("breakfast") || a.includes("dining")) return <Coffee className="w-3 h-3 text-amber-500" />;
    if (a.includes("spa")) return <Sparkles className="w-3 h-3 text-purple-500" />;
    if (a.includes("gym") || a.includes("fitness")) return <Dumbbell className="w-3 h-3 text-rose-500" />;
    return <CheckCircle2 className="w-3 h-3 text-emerald-500" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-3xl my-3 rounded-2xl bg-white dark:bg-[#1e1f20] border border-slate-200 dark:border-white/10 shadow-md text-slate-800 dark:text-slate-100 overflow-hidden"
    >
      {/* Hotel Search Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-white/10 bg-gradient-to-r from-indigo-600/10 via-amber-500/5 to-transparent dark:from-indigo-950/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-indigo-600/30">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  Premier Hotels & Stays
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 uppercase">
                  Verified Rates
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span className="font-semibold text-slate-800 dark:text-zinc-200">{location}</span>
                <span>&bull;</span>
                <span className="text-slate-500">{check_in} – {check_out} ({guests} Guests)</span>
              </p>
            </div>
          </div>

          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-zinc-300 shrink-0 self-start sm:self-center">
            {hotels.length} Properties
          </span>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-200/70 dark:border-white/5 overflow-x-auto pb-1">
          {[
            { id: "all", label: "All Stays" },
            { id: "luxury", label: "5-Star Luxury" },
            { id: "airport", label: "Airport Proximity" },
            { id: "value", label: "Best Value (< ৳15k)" },
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

          return (
            <motion.div
              key={hotel.id}
              whileHover={{ y: -2 }}
              className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.02] hover:border-indigo-400 dark:hover:border-indigo-500/40 transition-all overflow-hidden shadow-2xs group"
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
                      {hotel.amenities.slice(0, 5).map((amenity, aIdx) => (
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
                      <span className="text-[10px] text-slate-400 block">Nightly Rate</span>
                      <div className="text-base sm:text-lg font-black font-mono text-slate-900 dark:text-white leading-tight">
                        ৳{hotel.price_per_night_bdt.toLocaleString()}{" "}
                        <span className="text-xs font-normal text-slate-500">/ night</span>
                      </div>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-medium">
                        Taxes & breakfast options available
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
                        onClick={() => handleBook(hotel.id, hotel.room_types[0]?.name || "Standard Room")}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-xs ${
                          isBooked
                            ? "bg-emerald-600 text-white"
                            : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20"
                        }`}
                      >
                        {isBooked ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                            <span>Room Reserved!</span>
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
                      {hotel.room_types.map((room, rIdx) => (
                        <div
                          key={rIdx}
                          className="p-3 rounded-xl bg-white dark:bg-[#202124] border border-slate-200/80 dark:border-white/10 text-xs flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-1 mb-1">
                              <h5 className="font-bold text-slate-900 dark:text-white">{room.name}</h5>
                              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                                ৳{room.price_bdt.toLocaleString()}
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
                                  className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-zinc-300 font-mono"
                                >
                                  {feat}
                                </span>
                              ))}
                            </div>
                          </div>

                          <button
                            onClick={() => handleBook(hotel.id, room.name)}
                            className="mt-2.5 w-full py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-[11px] font-semibold transition-colors cursor-pointer border border-indigo-200 dark:border-indigo-800"
                          >
                            Reserve this Room
                          </button>
                        </div>
                      ))}
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
