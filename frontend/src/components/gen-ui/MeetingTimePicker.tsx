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
  Check,
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

/**
 * MeetingTimePicker
 *
 * Clean, minimal Generative UI calendar meeting scheduler.
 * Designed with restrained typography, subtle borders, and zero heavy shadows.
 */
export function MeetingTimePicker({
  data,
  status = "complete",
  respond,
  onConfirm,
  onDecline,
}: MeetingTimePickerProps) {
  const slots = data?.available_slots || [
    {
      id: "slot-1",
      date: "Tomorrow",
      start_time: "10:00 AM",
      end_time: "10:30 AM",
      duration_minutes: 30,
      is_recommended: true,
    },
    {
      id: "slot-2",
      date: "Tomorrow",
      start_time: "02:30 PM",
      end_time: "03:00 PM",
      duration_minutes: 30,
    },
    {
      id: "slot-3",
      date: "Friday",
      start_time: "11:15 AM",
      end_time: "11:45 AM",
      duration_minutes: 30,
    },
    {
      id: "slot-4",
      date: "Next Monday",
      start_time: "04:00 PM",
      end_time: "04:30 PM",
      duration_minutes: 30,
    },
  ];

  const [selectedSlotId, setSelectedSlotId] = useState<string>(
    slots.find((s) => s.is_recommended)?.id || slots[0]?.id || ""
  );
  const [isBooked, setIsBooked] = useState<boolean>(data?.status === "confirmed");
  const [isDeclined, setIsDeclined] = useState<boolean>(data?.status === "declined");

  const selectedSlot = slots.find((s) => s.id === selectedSlotId) || slots[0];

  const handleConfirm = () => {
    if (!selectedSlot) return;
    setIsBooked(true);

    try {
      confetti({
        particleCount: 28,
        spread: 50,
        origin: { y: 0.7 },
      });
    } catch {}

    if (respond) {
      respond(
        `Meeting confirmed for ${selectedSlot.date} at ${selectedSlot.start_time} - ${selectedSlot.end_time}.`
      );
    }
    if (onConfirm) {
      onConfirm(selectedSlot);
    }
  };

  const handleDecline = () => {
    setIsDeclined(true);
    if (respond) {
      respond("User requested alternative meeting times.");
    }
    if (onDecline) {
      onDecline();
    }
  };

  // Google Calendar URL Generator
  const getGoogleCalendarUrl = (slot: TimeSlot) => {
    const title = encodeURIComponent(data?.title || "GenUI Sync");
    const details = encodeURIComponent(
      `Meeting: ${data?.title || "Review"}\nPlatform: ${data?.google_meet_url || "https://meet.google.com"}`
    );
    const location = encodeURIComponent(data?.google_meet_url || "Google Meet");
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="w-full max-w-md my-2 rounded-xl bg-white dark:bg-[#18191a] border border-slate-200/90 dark:border-white/10 shadow-xs p-4 text-slate-800 dark:text-zinc-100 font-sans select-none"
    >
      {/* 1. Header: Clean title & duration */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-white/5">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            {data?.title || "Schedule Architecture Review"}
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>{data?.duration_minutes || 30} mins</span>
            <span>&bull;</span>
            <Video className="w-3 h-3 text-slate-400" />
            <span>Google Meet</span>
          </p>
        </div>
        <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
          <Calendar className="w-4 h-4" />
        </div>
      </div>

      {/* 2. Confirmed State Banner */}
      <AnimatePresence>
        {isBooked && selectedSlot && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="pt-3 space-y-2.5"
          >
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/40 text-xs">
              <div className="flex items-center gap-1.5 font-medium text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Meeting Booked</span>
              </div>
              <p className="text-emerald-700 dark:text-emerald-400 mt-1">
                {selectedSlot.date} &bull; {selectedSlot.start_time} - {selectedSlot.end_time}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={getGoogleCalendarUrl(selectedSlot)}
                target="_blank"
                rel="noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors"
              >
                <span>Add to Google Calendar</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              {data?.google_meet_url && (
                <a
                  href={data.google_meet_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-700 dark:text-zinc-200 text-xs font-medium transition-colors"
                >
                  <Video className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Meet Link</span>
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Declined State Banner */}
      <AnimatePresence>
        {isDeclined && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 my-3 text-xs text-slate-600 dark:text-zinc-400 flex items-center gap-2"
          >
            <XCircle className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Time slots declined. Ask the agent for other dates or times.</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Slot Selection Grid */}
      {!isBooked && !isDeclined && (
        <div className="pt-3 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {slots.map((slot) => {
              const isSelected = slot.id === selectedSlotId;
              return (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => setSelectedSlotId(slot.id)}
                  className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "border-blue-500 bg-blue-50/40 dark:bg-blue-500/10 text-blue-900 dark:text-blue-100 ring-1 ring-blue-500/20"
                      : "border-slate-200/70 dark:border-white/10 bg-transparent hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-zinc-300"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span>{slot.date}</span>
                    {slot.is_recommended && (
                      <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        Best
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 dark:text-zinc-400 mt-1">
                    {slot.start_time} - {slot.end_time}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/5">
            <button
              type="button"
              onClick={handleDecline}
              className="text-xs text-slate-400 hover:text-slate-700 dark:hover:text-zinc-300 transition-colors cursor-pointer"
            >
              None of these work
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 active:scale-98 text-white font-medium text-xs transition-colors cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Confirm Time</span>
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
