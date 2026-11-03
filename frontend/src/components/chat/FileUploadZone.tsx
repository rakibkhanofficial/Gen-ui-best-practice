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

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

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
      const res = await fetch(`${BACKEND_URL}/api/upload`, {
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
    window.open(`${BACKEND_URL}/api/download-sample-excel`, "_blank");
  };

  return (
    <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl text-slate-200">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          <h4 className="text-xs font-bold text-white">Upload Dataset or Image</h4>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
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
            ? "border-emerald-400 bg-emerald-950/20"
            : "border-slate-700/80 hover:border-slate-600 bg-slate-950/50"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv,.png,.jpg,.jpeg,.webp"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="w-10 h-10 mx-auto rounded-full bg-slate-800/80 flex items-center justify-center text-slate-300 mb-2">
          {isUploading ? (
            <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Upload className="w-5 h-5 text-emerald-400" />
          )}
        </div>

        <div className="text-xs font-semibold text-white">
          {isUploading ? "Uploading & Ingesting Dataset..." : "Click or drag & drop files here"}
        </div>
        <p className="text-[11px] text-slate-400 mt-1">
          Supports Excel (.xlsx, .csv) for Sales Dashboards &amp; Images for multimodal Q&amp;A
        </p>
      </div>

      {error && (
        <div className="mt-3 p-2.5 rounded-lg bg-rose-950/50 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Quick Download Sample Excel */}
      <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
        <span className="text-slate-400 text-[11px]">Don&apos;t have an Excel file ready?</span>
        <button
          onClick={handleDownloadSample}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 text-xs font-medium transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-emerald-400" />
          Download Sample Sales Excel
        </button>
      </div>
    </div>
  );
}

