"use client";

import React, { useState, useRef } from "react";
import {
  Upload,
  FileSpreadsheet,
  Image as ImageIcon,
  Download,
  CheckCircle2,
  AlertCircle,
  X,
  FileText
} from "lucide-react";

interface FileUploadZoneProps {
  onFileUploaded: (fileData: {
    filename: string;
    filePath: string;
    isExcel: boolean;
    preview?: any;
  }) => void;
  onClose?: () => void;
}

export function FileUploadZone({ onFileUploaded, onClose }: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await uploadFile(e.target.files[0]);
    }
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Upload failed with HTTP ${res.status}`);
      }

      const data = await res.json();
      onFileUploaded({
        filename: data.filename,
        filePath: data.file_path,
        isExcel: data.is_excel,
        preview: data.parsed_preview,
      });
      if (onClose) onClose();
    } catch (err: any) {
      setError(err.message || "Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadSample = () => {
    window.open("/api/download-sample-excel", "_blank");
  };

  return (
    <div className="p-4 bg-white dark:bg-[#1e1f20] border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl text-slate-800 dark:text-slate-200">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10 mb-3">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
          <h4 className="text-xs font-bold text-slate-900 dark:text-white">Upload Dataset or Image</h4>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
          isDragging
            ? "border-emerald-500 bg-emerald-500/10"
            : "border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 bg-slate-50 dark:bg-black/20"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          accept=".xlsx,.xls,.csv,image/*"
          className="hidden"
        />

        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-2">
          <Upload className="w-5 h-5" />
        </div>

        <p className="text-xs font-semibold text-slate-900 dark:text-white">
          {isUploading ? "Uploading & parsing with pandas..." : "Click to select or drag & drop"}
        </p>
        <p className="text-[11px] text-slate-500 dark:text-[#9aa0a6] mt-1">
          Supports Excel (.xlsx, .xls), CSV, or PNG/JPEG image files
        </p>
      </div>

      {error && (
        <div className="mt-3 p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Sample Template & Help */}
      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-xs">
        <span className="text-[11px] text-slate-500 dark:text-[#9aa0a6]">
          Need a sample dataset?
        </span>
        <button
          onClick={handleDownloadSample}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-[11px] font-medium transition-colors"
        >
          <Download className="w-3 h-3" /> Download Sample Excel
        </button>
      </div>
    </div>
  );
}
