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
  ShieldCheck,
  UserCheck,
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-3xl my-3 rounded-2xl bg-white dark:bg-[#1e1f20] border border-slate-200 dark:border-white/10 shadow-sm text-slate-800 dark:text-slate-100 overflow-hidden"
    >
      {/* Directory Header */}
      <div className="p-5 border-b border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-white/[0.02]">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-blue-600/30">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Specialist Doctor Directory
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                {specialty} &bull; {location}
              </p>
            </div>
          </div>

          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            {doctors.length} Verified Specialists
          </span>
        </div>
      </div>

      {/* Doctor Cards List */}
      <div className="divide-y divide-slate-100 dark:divide-white/5">
        {doctors.map((doc) => {
          const isSelected = selectedDoctorId === doc.id;
          const isBooked = bookedSlot?.doctorId === doc.id;
          const primaryChamber = doc.chambers[0];

          return (
            <div key={doc.id} className="p-4 sm:p-5 hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                {/* Left: Avatar & Info */}
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="relative shrink-0">
                    <img
                      src={doc.avatar_url}
                      alt={doc.name}
                      className="w-14 h-14 rounded-2xl object-cover border border-slate-200 dark:border-white/10 shadow-xs"
                    />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center ring-2 ring-white dark:ring-[#1e1f20]" title="BMDC Verified Specialist">
                      <ShieldCheck className="w-3 h-3" />
                    </div>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                        {doc.name}
                      </h4>
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-500 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{doc.rating}</span>
                        <span className="text-slate-400 font-normal">({doc.review_count})</span>
                      </div>
                    </div>

                    <p className="text-xs font-medium text-slate-700 dark:text-zinc-300 mt-0.5">
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
                  </div>
                </div>

                {/* Right: Fee & Action */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 dark:border-white/5 shrink-0">
                  <div>
                    <span className="text-[10px] text-slate-400 block sm:text-right">Consultation Fee</span>
                    <div className="text-base sm:text-lg font-bold font-mono text-slate-900 dark:text-white">
                      ৳{doc.consultation_fee_bdt.toFixed(0)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-2">
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
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Slot Reserved!</span>
                        </>
                      ) : (
                        <>
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Book Chamber</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Chamber Schedule Quick Drawer */}
              {primaryChamber && (
                <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {primaryChamber.hospital_name}
                    </span>
                    <span className="text-slate-400 hidden sm:inline">&bull;</span>
                    <span className="text-slate-500 dark:text-zinc-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {primaryChamber.location}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-slate-600 dark:text-zinc-300">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {primaryChamber.visiting_days}: {primaryChamber.visiting_hours}
                    </span>

                    <a
                      href={`tel:${primaryChamber.hotline}`}
                      className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline font-mono"
                    >
                      <Phone className="w-3 h-3" />
                      <span>{primaryChamber.hotline}</span>
                    </a>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
