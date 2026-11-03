"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plane,
  Clock,
  Luggage,
  ShieldCheck,
  Calendar,
  Users,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

export interface FlightSegment {
  airline: string;
  airline_logo: string;
  flight_number: string;
  departure_airport: string;
  departure_code: string;
  departure_time: string;
  arrival_airport: string;
  arrival_code: string;
  arrival_time: string;
  duration: string;
  aircraft: string;
  cabin_class: string;
  stops: number;
  stop_cities?: string[];
}

export interface FlightOption {
  id: string;
  price: number;
  currency: string;
  trip_type: string;
  outbound: FlightSegment;
  inbound?: FlightSegment;
  baggage: string;
  refundable: boolean;
  score: number;
  badge?: string;
}

export interface FlightDetailsData {
  origin?: string;
  origin_code?: string;
  destination?: string;
  destination_code?: string;
  departure_date?: string;
  return_date?: string;
  passengers?: number;
  cabin_class?: string;
  total_results?: number;
  flights?: FlightOption[];
}

interface FlightDetailsCardProps {
  data?: FlightDetailsData;
}

export function FlightDetailsCard({ data }: FlightDetailsCardProps) {
  const [selectedFlight, setSelectedFlight] = useState<string | null>(null);
  const [bookedFlight, setBookedFlight] = useState<string | null>(null);

  if (!data || !data.flights || data.flights.length === 0) {
    return (
      <div className="p-5 rounded-2xl bg-white dark:bg-[#1e1f20] border border-slate-200 dark:border-white/10 text-slate-500 text-xs">
        No flight data available.
      </div>
    );
  }

  const {
    origin = "Dhaka",
    origin_code = "DAC",
    destination = "Tokyo",
    destination_code = "NRT",
    departure_date = "Nov 15, 2026",
    passengers = 1,
    cabin_class = "Economy",
    flights = [],
  } = data;

  const handleBook = (flightId: string) => {
    setBookedFlight(flightId);
    setTimeout(() => setBookedFlight(null), 3000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="w-full rounded-2xl bg-white dark:bg-[#1e1f20] border border-slate-200 dark:border-white/10 shadow-lg overflow-hidden text-slate-800 dark:text-slate-100"
    >
      {/* Clean Route Header (Google Flights style) */}
      <div className="p-5 border-b border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-black/20">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-white/5 border border-blue-200/50 dark:border-white/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Plane className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-900 dark:text-white">
                Google Flights Search
              </span>
              <span className="block text-[11px] text-slate-500 dark:text-zinc-400">
                Live verified airfare & schedules
              </span>
            </div>
          </div>
          <span className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 text-slate-600 dark:text-zinc-400 font-medium">
            {flights.length} flights found
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
          <div className="flex items-center gap-4">
            <div>
              <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{origin_code}</div>
              <div className="text-xs text-slate-500 dark:text-zinc-400">{origin}</div>
            </div>
            <div className="flex flex-col items-center px-2">
              <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">One Way</span>
              <div className="w-16 h-0.5 bg-slate-200 dark:bg-zinc-700 relative my-1">
                <Plane className="w-3.5 h-3.5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-500 rotate-90" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{destination_code}</div>
              <div className="text-xs text-slate-500 dark:text-zinc-400">{destination}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs bg-white dark:bg-[#202124] px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-zinc-300 shadow-2xs">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-500" />
              <span>{departure_date}</span>
            </div>
            <span className="text-slate-300 dark:text-zinc-600">&bull;</span>
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-blue-500" />
              <span>{passengers} Pax ({cabin_class})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Flight Listings */}
      <div className="p-4 space-y-3.5">
        {flights.map((flight) => {
          const isSelected = selectedFlight === flight.id;
          const isBooked = bookedFlight === flight.id;
          const seg = flight.outbound;

          return (
            <motion.div
              key={flight.id}
              layout
              className={`rounded-xl border transition-all duration-200 ${
                isSelected
                  ? "border-blue-500 bg-blue-50/40 dark:bg-blue-950/20 shadow-md"
                  : "border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/15 bg-slate-50/60 dark:bg-[#282a2c]/60"
              } p-4`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Airline & Timing */}
                <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-black/30 border border-slate-200 dark:border-white/10 flex items-center justify-center p-1.5 shrink-0 shadow-xs">
                    {/* Airline Logo with fallback */}
                    <img
                      src={seg.airline_logo}
                      alt={seg.airline}
                      className="max-h-full max-w-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {seg.airline}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300 font-mono">
                        {seg.flight_number}
                      </span>
                      {flight.badge && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                          {flight.badge}
                        </span>
                      )}
                    </div>

                    {/* Timeline */}
                    <div className="flex items-center gap-3 text-xs">
                      <div>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          {seg.departure_time}
                        </span>{" "}
                        <span className="text-slate-500 font-mono text-[11px]">
                          {seg.departure_code}
                        </span>
                      </div>

                      <div className="flex flex-col items-center px-1 text-[10px] text-slate-400">
                        <span>{seg.duration}</span>
                        <div className="w-12 h-px bg-slate-300 dark:bg-slate-700 relative my-0.5">
                          {seg.stops > 0 && (
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                          )}
                        </div>
                        <span className={seg.stops === 0 ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-amber-600 dark:text-amber-400"}>
                          {seg.stops === 0 ? "Non-stop" : `${seg.stops} stop`}
                        </span>
                      </div>

                      <div>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          {seg.arrival_time}
                        </span>{" "}
                        <span className="text-slate-500 font-mono text-[11px]">
                          {seg.arrival_code}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pricing & Booking Action */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-200 dark:border-white/5 shrink-0 gap-1.5">
                  <div className="text-left sm:text-right">
                    <span className="text-xs text-slate-400">from </span>
                    <span className="text-lg font-bold text-slate-900 dark:text-white">
                      ${flight.price.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-500 block">per adult</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedFlight(isSelected ? null : flight.id)}
                      className="p-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
                      title="View flight details"
                    >
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${isSelected ? "rotate-180" : ""}`}
                      />
                    </button>
                    <button
                      onClick={() => handleBook(flight.id)}
                      disabled={isBooked}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-xs transition-all ${
                        isBooked
                          ? "bg-emerald-600 text-white cursor-default"
                          : "bg-blue-600 hover:bg-blue-500 text-white hover:shadow-md cursor-pointer active:scale-95"
                      }`}
                    >
                      {isBooked ? (
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Booked!
                        </span>
                      ) : (
                        "Select Flight"
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Collapsible Details Drawer */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="mt-3 pt-3 border-t border-slate-200 dark:border-white/10 text-xs space-y-2 text-slate-600 dark:text-slate-300"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-black/20 border border-slate-200 dark:border-white/5">
                        <Luggage className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <div>
                          <div className="text-[10px] text-slate-400">Baggage Allowance</div>
                          <div className="font-medium text-[11px]">{flight.baggage}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-black/20 border border-slate-200 dark:border-white/5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <div>
                          <div className="text-[10px] text-slate-400">Flexibility</div>
                          <div className="font-medium text-[11px]">
                            {flight.refundable ? "Refundable Ticket" : "Non-refundable"}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-black/20 border border-slate-200 dark:border-white/5">
                        <Plane className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <div>
                          <div className="text-[10px] text-slate-400">Aircraft & Cabin</div>
                          <div className="font-medium text-[11px]">{seg.aircraft}</div>
                        </div>
                      </div>
                    </div>

                    {seg.stop_cities && seg.stop_cities.length > 0 && (
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 pt-1">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>Transit layover in: <strong className="text-slate-700 dark:text-slate-200">{seg.stop_cities.join(", ")}</strong></span>
                      </div>
                    )}
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

