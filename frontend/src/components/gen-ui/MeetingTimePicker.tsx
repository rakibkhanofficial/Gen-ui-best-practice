"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  Video,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Users,
  Globe,
  Sparkles,
  CalendarCheck,
  ChevronRight,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import confetti from "canvas-confetti";

export interface TimeSlot {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  badge?: string;
  is_recommended?: boolean;
}

export interface MeetingParticipant {
  name: string;
  email: string;
  avatar: string;
  role: string;
}

export interface MeetingScheduleData {
  meeting_id?: string;
  title?: string;
  reason?: string;
  duration_minutes?: number;
  timezone?: string;
  host?: MeetingParticipant;
  participants?: MeetingParticipant[];
  available_slots?: TimeSlot[];
  google_meet_url?: string;
  status?: "pending" | "confirmed" | "declined";
}

interface MeetingTimePickerProps {
  data?: MeetingScheduleData;
  status?: "inProgress" | "executing" | "complete";
  respond?: (response: string) => void;
  onConfirm?: (slot: TimeSlot) => void;
  onDecline?: () => void;
}

export function MeetingTimePicker({
  data,
  status = "complete",
  respond,
  onConfirm,
  onDecline,
}: MeetingTimePickerProps) {
  const [selectedSlotId, setSelectedSlotId] = useState<string>(
    data?.available_slots?.find((s) => s.is_recommended)?.id ||
      data?.available_slots?.[0]?.id ||
      ""
  );
  const [isBooked, setIsBooked] = useState<boolean>(data?.status === "confirmed");
  const [isDeclined, setIsDeclined] = useState<boolean>(data?.status === "declined");
  const [confirmedSlot, setConfirmedSlot] = useState<TimeSlot | null>(
    data?.available_slots?.find((s) => s.id === selectedSlotId) || null
  );

  const slots = data?.available_slots || [];
  const selectedSlot = slots.find((s) => s.id === selectedSlotId) || slots[0];

  const handleConfirm = () => {
    if (!selectedSlot) return;
    setIsBooked(true);
    setConfirmedSlot(selectedSlot);

    // Fire celebration confetti
    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.65 },
    });

    if (respond) {
      respond(
        `User confirmed meeting for "${data?.title || 'Sync'}" on ${selectedSlot.date} at ${selectedSlot.start_time} - ${selectedSlot.end_time} (${selectedSlot.duration_minutes} mins).`
      );
    }
    if (onConfirm) {
      onConfirm(selectedSlot);
    }
  };

  const handleDecline = () => {
    setIsDeclined(true);
    if (respond) {
      respond("User declined proposed meeting time slots.");
    }
    if (onDecline) {
      onDecline();
    }
  };

  // Google Calendar URL Generator
  const getGoogleCalendarUrl = (slot: TimeSlot) => {
    const title = encodeURIComponent(data?.title || "GenUI Alignment Meeting");
    const details = encodeURIComponent(
      `Meeting Topic: ${data?.reason || "Generative UI Architecture Review"}\nGoogle Meet: ${
        data?.google_meet_url || "https://meet.google.com"
      }\nScheduled via CopilotKit & Antigravity Agent.`
    );
    const location = encodeURIComponent(data?.google_meet_url || "Google Meet");
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-xl my-4 rounded-3xl bg-white dark:bg-[#1a1b1c] border border-slate-200/90 dark:border-white/10 shadow-xl p-5 sm:p-6 text-slate-800 dark:text-zinc-100 font-sans select-none overflow-hidden"
    >
      {/* 1. Header with Badge & Meeting Title */}
      <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-200/80 dark:border-white/10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/50">
              <Calendar className="w-3 h-3" />
              <span>Generative UI &bull; Meeting Time Picker</span>
            </span>
            <span className="text-[11px] text-slate-400 dark:text-zinc-500 font-mono">
              {data?.duration_minutes || 30} mins
            </span>
          </div>

          <h3 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            {data?.title || "Schedule Architecture Alignment"}
          </h3>
          {data?.reason && (
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              {data.reason}
            </p>
          )}
        </div>

        <div className="w-9 h-9 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
          <CalendarCheck className="w-5 h-5" />
        </div>
      </div>

      {/* 2. Meeting Context: Video & Timezone */}
      <div className="grid grid-cols-2 gap-2 my-3.5 text-xs">
        <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/5 flex items-center gap-2">
          <Video className="w-4 h-4 text-emerald-500 shrink-0" />
          <div className="truncate">
            <span className="text-[10px] text-slate-400 dark:text-zinc-500 block uppercase font-mono">Platform</span>
            <span className="font-semibold text-slate-800 dark:text-zinc-200 truncate block">Google Meet HD</span>
          </div>
        </div>

        <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/5 flex items-center gap-2">
          <Globe className="w-4 h-4 text-blue-500 shrink-0" />
          <div className="truncate">
            <span className="text-[10px] text-slate-400 dark:text-zinc-500 block uppercase font-mono">Timezone</span>
            <span className="font-semibold text-slate-800 dark:text-zinc-200 truncate block">GMT+6 (Dhaka)</span>
          </div>
        </div>
      </div>

      {/* 3. Confirmed State Banner */}
      <AnimatePresence>
        {isBooked && confirmedSlot && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 my-4 space-y-3"
          >
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-semibold text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Meeting Confirmed &amp; Dispatched!</span>
            </div>

            <p className="text-xs text-emerald-800 dark:text-emerald-200">
              Scheduled for <strong>{confirmedSlot.date}</strong> from{" "}
              <strong>{confirmedSlot.start_time} - {confirmedSlot.end_time}</strong>. Calendar invites sent to all participants.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <a
                href={getGoogleCalendarUrl(confirmedSlot)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors shadow-xs"
              >
                <span>Add to Google Calendar</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              {data?.google_meet_url && (
                <a
                  href={data.google_meet_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-white/10 hover:bg-slate-100 dark:hover:bg-white/15 text-slate-700 dark:text-zinc-200 text-xs font-medium border border-slate-200 dark:border-white/10 transition-colors"
                >
                  <Video className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Join Google Meet</span>
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Declined State Banner */}
      <AnimatePresence>
        {isDeclined && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 my-3 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2"
          >
            <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>Time slots declined. You can ask the agent to suggest alternate times or dates.</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. Interactive Time Slot Selection Grid (When not booked or declined) */}
      {!isBooked && !isDeclined && (
        <>
          <div className="space-y-2 my-4">
            <label className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
              Choose a Time Slot:
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {slots.map((slot) => {
                const isSelected = slot.id === selectedSlotId;
                return (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => setSelectedSlotId(slot.id)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative ${
                      isSelected
                        ? "bg-blue-50/80 dark:bg-blue-950/30 border-blue-500 ring-2 ring-blue-500/20 shadow-xs"
                        : "bg-white dark:bg-[#1f2022] border-slate-200/80 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-50 dark:hover:bg-white/5"
                    }`}
                  >
                    {/* Recommended Badge */}
                    {slot.badge && (
                      <span
                        className={`text-[9px] font-semibold tracking-wider px-2 py-0.5 rounded-full inline-block mb-1.5 ${
                          slot.is_recommended
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-300/60"
                            : "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-zinc-400"
                        }`}
                      >
                        {slot.badge}
                      </span>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-slate-900 dark:text-white block">
                        {slot.date}
                      </span>
                      <div
                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          isSelected
                            ? "border-blue-600 bg-blue-600 text-white"
                            : "border-slate-300 dark:border-zinc-600"
                        }`}
                      >
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-zinc-300 mt-1 font-mono">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{slot.start_time} - {slot.end_time}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 6. Participants Avatars */}
          {data?.participants && data.participants.length > 0 && (
            <div className="pt-2 pb-4 border-t border-slate-100 dark:border-white/5">
              <span className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block mb-2">
                Participants:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {/* Host */}
                {data.host && (
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-slate-100 dark:bg-white/5 text-xs text-slate-700 dark:text-zinc-300">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={data.host.avatar}
                      alt={data.host.name}
                      className="w-4 h-4 rounded-full"
                    />
                    <span className="font-medium text-[11px]">{data.host.name} (Host)</span>
                  </div>
                )}

                {/* Attendees */}
                {data.participants.map((p, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-slate-100 dark:bg-white/5 text-xs text-slate-700 dark:text-zinc-300"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.avatar} alt={p.name} className="w-4 h-4 rounded-full" />
                    <span className="text-[11px]">{p.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 7. Action Buttons (Human-in-the-Loop Confirmation) */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200/80 dark:border-white/10">
            <button
              type="button"
              onClick={handleDecline}
              className="text-xs text-slate-500 hover:text-rose-500 dark:text-zinc-400 dark:hover:text-rose-400 transition-colors cursor-pointer"
            >
              Decline / Reschedule
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-98 text-white font-medium text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Confirm &amp; Book Time</span>
            </button>
          </div>
        </>
      )}
    </motion.div>
  );
}
