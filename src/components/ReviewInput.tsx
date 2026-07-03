import React, { useState, useRef } from "react";
import { Upload, FileText, Sparkles, Database, AlertCircle } from "lucide-react";
import { SAMPLE_DATASETS, SampleDataset } from "../data";
import { UserSubscription } from "../types";

interface ReviewInputProps {
  reviewsText: string;
  setReviewsText: (text: string) => void;
  focusArea: string;
  setFocusArea: (text: string) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  error: string | null;
  subscription: UserSubscription;
  onOpenPlans: () => void;
}

export default function ReviewInput({
  reviewsText,
  setReviewsText,
  focusArea,
  setFocusArea,
  onAnalyze,
  isAnalyzing,
  error,
  subscription,
  onOpenPlans,
}: ReviewInputProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setReviewsText(text);
      }
    };
    reader.readAsText(file);
  };

  const loadSample = (sample: SampleDataset) => {
    setReviewsText(sample.reviews);
    setFocusArea(sample.focusArea);
  };

  const wordCount = reviewsText.trim() === "" ? 0 : reviewsText.trim().split(/\s+/).length;
  const reviewCount = reviewsText.split(/\n+/).filter(line => line.trim().length > 10).length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
          <Database id="input-section-icon" className="w-6 h-6" />
        </div>
        <div>
          <h2 id="input-section-title" className="text-xl font-bold text-slate-900 tracking-tight">
            Import Raw Feedback
          </h2>
          <p className="text-sm text-slate-500">
            Paste customer reviews, upload text/csv files, or load a high-quality sample.
          </p>
        </div>
      </div>

      {/* Sample Data Quick Loader */}
      <div className="mb-6">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-3">
          Quick-Load Sample Datasets
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {SAMPLE_DATASETS.map((sample) => {
            const isLoaded = reviewsText === sample.reviews;
            return (
              <button
                key={sample.name}
                type="button"
                onClick={() => loadSample(sample)}
                className={`p-3.5 text-left rounded-xl border transition-all text-xs flex flex-col justify-between h-28 ${
                  isLoaded
                    ? "border-indigo-600 bg-indigo-50/50 shadow-sm ring-2 ring-indigo-100"
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div>
                  <span className="font-bold text-slate-800 block mb-1">{sample.name}</span>
                  <span className="text-slate-500 line-clamp-2 leading-relaxed">
                    {sample.description}
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wider block mt-2">
                  Focus: {sample.focusArea}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* File Upload & Text Area Drag-and-Drop Container */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative rounded-xl border-2 border-dashed transition-all p-1 ${
          isDragging
            ? "border-indigo-500 bg-indigo-50/30"
            : "border-slate-200 hover:border-slate-300"
        }`}
      >
        {/* Text Area */}
        <textarea
          value={reviewsText}
          onChange={(e) => setReviewsText(e.target.value)}
          placeholder={`Paste customer reviews or drag and drop a raw file here...

Example formats supported:
• Chronological lists: "[2026-06-01] Great service, loved the UI!"
• Simple sentences: "The app crashed three times on Android last night."
• Paragraphs or feedback transcripts.`}
          className="w-full h-72 p-5 text-sm text-slate-800 border-0 focus:ring-0 resize-none rounded-lg focus:outline-none placeholder:text-slate-400 font-sans"
        />

        {/* Drag Over and Upload Footer */}
        <div className="flex flex-wrap items-center justify-between border-t border-slate-200 p-4 bg-slate-50/50 rounded-b-lg">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg shadow-sm transition-all"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              Upload file (.txt, .csv)
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".txt,.csv"
              className="hidden"
            />
            {wordCount > 0 && (
              <span className="text-xs text-slate-500 flex items-center gap-1.5 font-mono">
                <FileText className="w-3.5 h-3.5" />
                {wordCount.toLocaleString()} words &bull; {reviewCount} items
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Drag & drop text or CSV files to import automatically
          </span>
        </div>
      </div>

      {/* Advanced Optimization Config */}
      <div className="mt-5 grid grid-cols-1 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            AI Focus Area (Optional)
          </label>
          <input
            type="text"
            value={focusArea}
            onChange={(e) => setFocusArea(e.target.value)}
            placeholder="e.g., pricing, Android app performance, onboarding, food quality"
            className="w-full px-4 py-2.5 text-sm text-slate-800 bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all"
          />
          <p className="text-xs text-slate-400 mt-1.5">
            Instructs Gemini to analyze specific elements, keywords, or features more deeply.
          </p>
        </div>
      </div>

      {/* Free Tier Limitation Warnings */}
      {subscription.tier === "free" && reviewCount > 15 && (
        <div className="mt-5 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-amber-900 text-xs sm:text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-amber-500 mt-0.5 animate-pulse" />
          <div className="space-y-1.5 flex-grow">
            <span className="font-bold block text-amber-950">Free Tier Limit Warning</span>
            <span className="text-amber-800 leading-relaxed block">
              You've imported <strong>{reviewCount} reviews</strong>, which exceeds the Free plan allowance of <strong>15 reviews per run</strong>. Only the first 15 entries will be parsed by Gemini.
            </span>
            <button
              type="button"
              onClick={onOpenPlans}
              className="mt-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold px-3.5 py-1.5 rounded-lg text-xs transition cursor-pointer"
            >
              Upgrade to growth plan
            </button>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="mt-5 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
          <div>
            <span className="font-semibold block mb-0.5">Analysis failed</span>
            <span className="text-red-600 leading-relaxed">{error}</span>
          </div>
        </div>
      )}

      {/* Action CTA Button */}
      <div className="mt-6">
        <button
          type="button"
          onClick={onAnalyze}
          disabled={isAnalyzing || reviewsText.trim().length === 0}
          className={`w-full py-4 px-6 rounded-xl font-medium text-sm flex items-center justify-center gap-2.5 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-100 ${
            isAnalyzing
              ? "bg-slate-100 text-slate-400 cursor-not-allowed"
              : reviewsText.trim().length === 0
              ? "bg-slate-100 text-slate-400 cursor-not-allowed"
              : "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md hover:shadow-indigo-500/10 active:scale-[0.99]"
          }`}
        >
          {isAnalyzing ? (
            <>
              <svg
                className="animate-spin h-5 w-5 text-indigo-500"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Analyzing Reviews with High-Thinking Gemini AI...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-indigo-200" />
              <span>Generate Customer Sentiment Report</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
