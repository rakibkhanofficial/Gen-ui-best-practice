"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Stethoscope,
  Star,
  Clock,
  MapPin,
  Calendar,
  Phone,
  CheckCircle2,
  Building2,
  ChevronRight,
  ChevronDown,
  ShieldCheck,
  UserCheck,
  Hospital,
} from "lucide-react";

export interface DoctorChamber {
  hospital_name: string;
  location: string;
  visiting_days: string;
  visiting_hours: string;
  room_no: string;
  hotline: string;
}

export interface DoctorItem {
  id: string;
  name: string;
  avatar_url: string;
  degrees: string;
  designation: string;
  specialty: string;
  experience_years: number;
  rating: number;
  review_count: number;
  consultation_fee_bdt: number;
  chambers: DoctorChamber[];
  key_expertise: string[];
  available_today: boolean;
  appointment_slot: string;
}

export interface DoctorSearchData {
  query: string;
  specialty: string;
  location: string;
  total_results: number;
  doctors: DoctorItem[];
}

interface DoctorDirectoryCardProps {
  data?: DoctorSearchData;
}

/**
 * Resilient Doctor Avatar with Fallback Initial Badge.
 * Guarantees zero broken images if external CDN/image fails.
 */
function DoctorAvatar({ src, name }: { src: string; name: string }) {
  const [hasError, setHasError] = useState(false);

  // Extract clean initials (stripping titles like Prof. Dr. etc)
  const cleanName = name.replace(/^(Prof\.|Dr\.|Major\s+Gen\.|Brig\.|Col\.)\s*/gi, "").trim();
  const parts = cleanName.split(" ").filter(Boolean);
  const initials =
    parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : cleanName.slice(0, 2).toUpperCase() || "DR";

  if (hasError || !src) {
    return (
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-sky-700 text-white flex flex-col items-center justify-center font-bold text-sm tracking-wider shadow-sm border border-blue-400/30 shrink-0 select-none">
        <span>{initials}</span>
        <Stethoscope className="w-3 h-3 text-blue-200 mt-0.5 opacity-90" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      onError={() => setHasError(true)}
      className="w-14 h-14 rounded-2xl object-cover border border-slate-200 dark:border-white/10 shadow-xs shrink-0"
      loading="lazy"
    />
  );
}

export function DoctorDirectoryCard({ data }: DoctorDirectoryCardProps) {
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [bookedSlot, setBookedSlot] = useState<{ doctorId: string; slot: string } | null>(null);

  if (!data?.doctors || data.doctors.length === 0) {
    return (
      <div className="w-full max-w-3xl p-5 rounded-2xl bg-white dark:bg-[#1e1f20] border border-slate-200 dark:border-white/10 text-slate-500 text-xs">
        No specialist doctor directory found.
      </div>
    );
  }

  const { query, specialty, location, doctors } = data;

  const handleBook = (docId: string, slot: string) => {
    setBookedSlot({ doctorId: docId, slot });
    setTimeout(() => {
      setBookedSlot(null);
    }, 3500);
  };

  const toggleChambers = (id: string) => {
    setSelectedDoctorId(selectedDoctorId === id ? null : id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-3xl my-3 rounded-2xl bg-white dark:bg-[#1e1f20] border border-slate-200 dark:border-white/10 shadow-md text-slate-800 dark:text-slate-100 overflow-hidden"
    >
      {/* Directory Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-white/10 bg-gradient-to-r from-blue-600/10 via-sky-500/5 to-transparent dark:from-blue-950/30">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-blue-600/30">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  Top Verified Specialists
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 uppercase">
                  BMDC Registered
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5">
                {specialty} &bull; {location}
              </p>
            </div>
          </div>

          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shrink-0">
            {doctors.length} Doctors
          </span>
        </div>
      </div>

      {/* Doctor Cards List */}
      <div className="divide-y divide-slate-100 dark:divide-white/5">
        {doctors.map((doc) => {
          const isExpanded = selectedDoctorId === doc.id;
          const isBooked = bookedSlot?.doctorId === doc.id;
          const primaryChamber = doc.chambers[0];

          return (
            <div
              key={doc.id}
              className="p-4 sm:p-5 hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                {/* Left: Avatar & Info */}
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <div className="relative shrink-0">
                    <DoctorAvatar src={doc.avatar_url} name={doc.name} />
                    <div
                      className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center ring-2 ring-white dark:ring-[#1e1f20]"
                      title="BMDC Verified Specialist"
                    >
                      <ShieldCheck className="w-3 h-3" />
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                        {doc.name}
                      </h4>
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-500 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{doc.rating}</span>
                        <span className="text-slate-400 font-normal">({doc.review_count})</span>
                      </div>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-zinc-300">
                        {doc.experience_years}+ Yrs Exp
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mt-0.5">
                      {doc.designation}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono mt-0.5 line-clamp-1">
                      {doc.degrees}
                    </p>

                    {/* Expertise Pills */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {doc.key_expertise.slice(0, 3).map((exp, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-zinc-300 border border-slate-200/80 dark:border-white/5"
                        >
                          {exp}
                        </span>
                      ))}
                    </div>

                    {/* Primary Hospital */}
                    {primaryChamber && (
                      <div className="mt-2.5 flex items-center gap-1.5 text-xs text-slate-600 dark:text-zinc-400">
                        <Hospital className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="font-medium text-slate-800 dark:text-zinc-200 truncate">
                          {primaryChamber.hospital_name}
                        </span>
                        <span>&bull;</span>
                        <span className="truncate text-slate-500 text-[11px]">
                          {primaryChamber.location}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Fee & Action */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 dark:border-white/5 shrink-0">
                  <div>
                    <span className="text-[10px] text-slate-400 block sm:text-right">
                      Consultation Fee
                    </span>
                    <div className="text-base sm:text-lg font-bold font-mono text-slate-900 dark:text-white">
                      ৳{doc.consultation_fee_bdt.toFixed(0)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => toggleChambers(doc.id)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-xs font-medium text-slate-600 dark:text-zinc-300 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span>Chambers ({doc.chambers.length})</span>
                      {isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      onClick={() => handleBook(doc.id, doc.appointment_slot)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-xs ${
                        isBooked
                          ? "bg-emerald-600 text-white"
                          : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20"
                      }`}
                    >
                      {isBooked ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                          <span>Serial Booked!</span>
                        </>
                      ) : (
                        <>
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Book Appointment</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Collapsible Chamber Details */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden mt-3 pt-3 border-t border-slate-100 dark:border-white/5"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {doc.chambers.map((chamber, cIdx) => (
                        <div
                          key={cIdx}
                          className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/10 text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 dark:text-white">
                              {chamber.hospital_name}
                            </span>
                            <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 font-semibold">
                              {chamber.room_no}
                            </span>
                          </div>

                          <div className="text-slate-500 dark:text-zinc-400 flex items-center gap-1 text-[11px]">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{chamber.location}</span>
                          </div>

                          <div className="text-slate-600 dark:text-zinc-300 flex items-center justify-between pt-1 border-t border-slate-200/40 dark:border-white/5 text-[11px]">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-blue-500" />
                              {chamber.visiting_days}
                            </span>
                            <span className="flex items-center gap-1 font-mono">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {chamber.visiting_hours}
                            </span>
                          </div>

                          <div className="pt-1 flex items-center justify-between text-[11px]">
                            <span className="text-slate-500">Hotline:</span>
                            <a
                              href={`tel:${chamber.hotline}`}
                              className="font-mono font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1"
                            >
                              <Phone className="w-3 h-3" />
                              <span>{chamber.hotline}</span>
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
