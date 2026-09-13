import React from 'react';
import { ScreenType } from '../Navigation';

interface SkeletonProps {
  className?: string;
  id?: string;
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', id, style }) => {
  return (
    <div
      id={id}
      style={style}
      className={`animate-skeleton bg-[#EFE8D8]/75 rounded-[4px] border border-[rgba(34,30,24,0.04)] ${className}`}
    />
  );
};

export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({
  lines = 3,
  className = ''
}) => {
  const widths = ['w-full', 'w-[92%]', 'w-[85%]', 'w-[96%]', 'w-[78%]', 'w-[64%]'];
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, idx) => (
        <Skeleton key={idx} className={`h-3.5 ${widths[idx % widths.length]}`} />
      ))}
    </div>
  );
};

/**
 * Skeleton Loader for Editor Screen
 */
export const EditorSkeleton: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col h-full bg-[#FAF6EE] overflow-hidden">
      {/* Top Format Bar Skeleton */}
      <div className="h-10 border-b border-[#E5DEC9] bg-[#FAF6EE] px-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Skeleton className="w-16 h-6" />
          <Skeleton className="w-20 h-6" />
          <div className="w-px h-4 bg-[#E5DEC9]" />
          <Skeleton className="w-7 h-6" />
          <Skeleton className="w-7 h-6" />
          <Skeleton className="w-7 h-6" />
          <div className="w-px h-4 bg-[#E5DEC9]" />
          <Skeleton className="w-24 h-6" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="w-16 h-5" />
          <Skeleton className="w-20 h-6 rounded-md" />
        </div>
      </div>

      {/* Main Workspace: Left Outline + Center Canvas + Right Inspector */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigator Rail Skeleton */}
        <div className="w-64 border-r border-[#E5DEC9] bg-[#F1EAD9]/40 p-4 space-y-4 hidden lg:block">
          <div className="flex items-center justify-between">
            <Skeleton className="w-24 h-4" />
            <Skeleton className="w-6 h-6 rounded" />
          </div>
          <div className="space-y-2 pt-2">
            <Skeleton className="w-full h-8 rounded" />
            <Skeleton className="w-[90%] h-7 rounded ml-3" />
            <Skeleton className="w-[90%] h-7 rounded ml-3" />
            <Skeleton className="w-full h-8 rounded mt-4" />
            <Skeleton className="w-[90%] h-7 rounded ml-3" />
            <Skeleton className="w-[90%] h-7 rounded ml-3" />
            <Skeleton className="w-[90%] h-7 rounded ml-3" />
          </div>
        </div>

        {/* Center Manuscript Canvas Skeleton */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-12 flex justify-center">
          <div className="w-full max-w-2xl space-y-6">
            {/* Title & Metadata Header */}
            <div className="space-y-3 pb-6 border-b border-[#E5DEC9]">
              <Skeleton className="w-32 h-4" />
              <Skeleton className="w-3/4 h-8" />
              <Skeleton className="w-1/2 h-4" />
            </div>

            {/* Manuscript Paragraphs */}
            <div className="space-y-6 pt-2">
              <SkeletonText lines={4} />
              <SkeletonText lines={5} />
              <div className="flex justify-center py-2">
                <Skeleton className="w-12 h-2" />
              </div>
              <SkeletonText lines={4} />
              <SkeletonText lines={6} />
            </div>
          </div>
        </div>

        {/* Right Inspector Rail Skeleton */}
        <div className="w-72 border-l border-[#E5DEC9] bg-[#F1EAD9]/30 p-4 space-y-5 hidden xl:block">
          <Skeleton className="w-full h-7 rounded" />
          <div className="space-y-3">
            <Skeleton className="w-20 h-3" />
            <Skeleton className="w-full h-16 rounded" />
          </div>
          <div className="space-y-2">
            <Skeleton className="w-24 h-3" />
            <div className="flex gap-1.5 flex-wrap">
              <Skeleton className="w-16 h-6 rounded-full" />
              <Skeleton className="w-20 h-6 rounded-full" />
              <Skeleton className="w-14 h-6 rounded-full" />
            </div>
          </div>
          <div className="space-y-2 pt-2">
            <Skeleton className="w-28 h-3" />
            <Skeleton className="w-full h-20 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Skeleton Loader for Home Screen / Dashboard
 */
export const HomeSkeleton: React.FC = () => {
  return (
    <div className="flex-1 overflow-y-auto bg-[#FAF6EE] p-4 sm:p-8 lg:p-12">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Welcome Banner */}
        <div className="bg-[#F1EAD9] p-6 sm:p-8 rounded-[8px] border border-[rgba(34,30,24,0.12)] space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="w-36 h-4" />
            <Skeleton className="w-24 h-6 rounded" />
          </div>
          <Skeleton className="w-2/3 h-8" />
          <Skeleton className="w-1/2 h-4" />
          <div className="pt-2 flex gap-3">
            <Skeleton className="w-36 h-10 rounded-md" />
            <Skeleton className="w-32 h-10 rounded-md" />
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#F1EAD9] p-5 rounded-[8px] border border-[rgba(34,30,24,0.12)] space-y-2">
            <Skeleton className="w-24 h-3" />
            <Skeleton className="w-28 h-7" />
            <Skeleton className="w-full h-2 rounded-full mt-2" />
          </div>
          <div className="bg-[#F1EAD9] p-5 rounded-[8px] border border-[rgba(34,30,24,0.12)] space-y-2">
            <Skeleton className="w-24 h-3" />
            <Skeleton className="w-24 h-7" />
            <Skeleton className="w-32 h-3" />
          </div>
          <div className="bg-[#F1EAD9] p-5 rounded-[8px] border border-[rgba(34,30,24,0.12)] space-y-2">
            <Skeleton className="w-28 h-3" />
            <Skeleton className="w-20 h-7" />
            <Skeleton className="w-36 h-3" />
          </div>
        </div>

        {/* Two Column Layout: Velocity Chart + Recent Scenes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-[#F1EAD9] p-6 rounded-[8px] border border-[rgba(34,30,24,0.12)] space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="w-32 h-4" />
              <Skeleton className="w-24 h-6 rounded" />
            </div>
            {/* Simulated bar chart */}
            <div className="h-40 flex items-end justify-between gap-3 pt-4">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <Skeleton className={`w-full rounded-t`} style={{ height: `${30 + (i * 12) % 65}%` } as React.CSSProperties} />
                  <Skeleton className="w-6 h-3" />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#F1EAD9] p-6 rounded-[8px] border border-[rgba(34,30,24,0.12)] space-y-4">
            <Skeleton className="w-28 h-4" />
            <div className="space-y-3">
              <Skeleton className="w-full h-12 rounded" />
              <Skeleton className="w-full h-12 rounded" />
              <Skeleton className="w-full h-12 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Skeleton Loader for Projects Screen (with Book Cover Silhouettes)
 */
export const ProjectsSkeleton: React.FC = () => {
  return (
    <div className="flex-1 overflow-y-auto bg-[#FAF6EE] p-4 sm:p-8 lg:p-12">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header strip */}
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="w-48 h-8" />
            <Skeleton className="w-64 h-4" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="w-28 h-9 rounded" />
            <Skeleton className="w-32 h-9 rounded" />
          </div>
        </div>

        {/* Global Summary Metrics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-[#F1EAD9] p-4 rounded-[8px] border border-[rgba(34,30,24,0.12)] space-y-2">
            <Skeleton className="w-20 h-3" />
            <Skeleton className="w-16 h-7" />
          </div>
          <div className="bg-[#F1EAD9] p-4 rounded-[8px] border border-[rgba(34,30,24,0.12)] space-y-2">
            <Skeleton className="w-28 h-3" />
            <Skeleton className="w-24 h-7" />
          </div>
          <div className="bg-[#F1EAD9] p-4 rounded-[8px] border border-[rgba(34,30,24,0.12)] space-y-2">
            <Skeleton className="w-24 h-3" />
            <Skeleton className="w-16 h-7" />
          </div>
        </div>

        {/* Controls Bar */}
        <div className="bg-[#F1EAD9] p-3 rounded-[8px] border border-[rgba(34,30,24,0.12)] flex items-center justify-between gap-4">
          <Skeleton className="w-72 h-8 rounded" />
          <div className="flex gap-2">
            <Skeleton className="w-24 h-8 rounded" />
            <Skeleton className="w-24 h-8 rounded" />
          </div>
        </div>

        {/* Projects Grid with Book Cover silhouettes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-[#F1EAD9] rounded-[8px] border border-[rgba(34,30,24,0.12)] p-6 flex flex-col sm:flex-row gap-5"
            >
              {/* 3D Book Cover silhouette */}
              <div className="w-28 sm:w-32 h-44 sm:h-48 rounded-[4px] border border-[rgba(34,30,24,0.1)] shadow-warm-sm shrink-0 flex flex-col justify-between p-3 animate-skeleton bg-[#E5DEC9]">
                <Skeleton className="w-16 h-3 bg-white/40" />
                <div className="space-y-1 my-auto">
                  <Skeleton className="w-full h-4 bg-white/50" />
                  <Skeleton className="w-3/4 h-3 bg-white/40" />
                </div>
                <Skeleton className="w-12 h-2 bg-white/40" />
              </div>

              {/* Manuscript details */}
              <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="w-20 h-4 rounded" />
                  <Skeleton className="w-16 h-4 rounded" />
                </div>
                <Skeleton className="w-3/4 h-6" />
                <Skeleton className="w-full h-3" />
                <Skeleton className="w-5/6 h-3" />
                <div className="pt-4 flex items-center justify-between">
                  <Skeleton className="w-24 h-3" />
                  <Skeleton className="w-28 h-8 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Skeleton Loader for Editorial Desk Screen
 */
export const EditorialSkeleton: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col h-full bg-[#FAF6EE] overflow-hidden">
      {/* Top Reassurance & Stats Strip */}
      <div className="h-10 bg-[#F8F5EE] border-b border-[rgba(34,30,24,0.08)] px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="w-32 h-4" />
          <Skeleton className="w-24 h-4" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="w-20 h-6 rounded" />
          <Skeleton className="w-24 h-6 rounded" />
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigator Skeleton */}
        <div className="w-64 border-r border-[#E5DEC9] bg-[#F1EAD9]/40 p-4 space-y-3 hidden md:block">
          <Skeleton className="w-28 h-4" />
          <Skeleton className="w-full h-8 rounded" />
          <Skeleton className="w-full h-8 rounded" />
          <Skeleton className="w-full h-8 rounded" />
        </div>

        {/* Center Redline Diff Skeleton */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-5">
          <div className="max-w-3xl mx-auto space-y-5">
            <div className="space-y-2 pb-4 border-b border-[#E5DEC9]">
              <Skeleton className="w-24 h-3" />
              <Skeleton className="w-1/2 h-7" />
            </div>
            <div className="bg-white/70 rounded-[8px] border border-[rgba(34,30,24,0.12)] p-6 space-y-4">
              <SkeletonText lines={5} />
              <SkeletonText lines={4} />
              <SkeletonText lines={6} />
            </div>
          </div>
        </div>

        {/* Right Editorial Queries Skeleton */}
        <div className="w-72 border-l border-[#E5DEC9] bg-[#F1EAD9]/30 p-4 space-y-4 hidden lg:block">
          <div className="flex gap-2">
            <Skeleton className="flex-1 h-7 rounded" />
            <Skeleton className="flex-1 h-7 rounded" />
          </div>
          <div className="space-y-3 pt-2">
            <Skeleton className="w-full h-20 rounded" />
            <Skeleton className="w-full h-20 rounded" />
            <Skeleton className="w-full h-20 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Skeleton Loader for Corkboard / Outliner (Dashboard)
 */
export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="flex-1 overflow-y-auto bg-[#FAF6EE] p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="w-48 h-8" />
        <div className="flex gap-2">
          <Skeleton className="w-20 h-7 rounded" />
          <Skeleton className="w-24 h-7 rounded" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="bg-[#F1EAD9] rounded-[6px] border border-[rgba(34,30,24,0.12)] p-4 space-y-3 shadow-warm-sm h-48 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="w-12 h-3" />
                <Skeleton className="w-14 h-3 rounded-full" />
              </div>
              <Skeleton className="w-4/5 h-5" />
              <Skeleton className="w-full h-3" />
              <Skeleton className="w-3/4 h-3" />
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-[rgba(34,30,24,0.08)]">
              <Skeleton className="w-16 h-3" />
              <Skeleton className="w-12 h-3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Skeleton Loader for Codex / Story Bible
 */
export const BibleSkeleton: React.FC = () => {
  return (
    <div className="flex-1 overflow-y-auto bg-[#FAF6EE] p-6 sm:p-10 space-y-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="w-40 h-8" />
          <Skeleton className="w-28 h-9 rounded" />
        </div>
        <div className="flex gap-2 border-b border-[#E5DEC9] pb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="w-24 h-7 rounded" />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-[#F1EAD9] rounded-[8px] border border-[rgba(34,30,24,0.12)] p-5 space-y-4"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="w-12 h-12 rounded-full shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="w-3/4 h-5" />
                  <Skeleton className="w-1/2 h-3" />
                </div>
              </div>
              <SkeletonText lines={2} />
              <div className="flex gap-1.5 pt-2">
                <Skeleton className="w-16 h-5 rounded-full" />
                <Skeleton className="w-20 h-5 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Skeleton Loader for Continuity Radar
 */
export const ContinuitySkeleton: React.FC = () => {
  return (
    <div className="flex-1 overflow-y-auto bg-[#FAF6EE] p-6 sm:p-10 space-y-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="space-y-2">
          <Skeleton className="w-48 h-8" />
          <Skeleton className="w-72 h-4" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-[#F1EAD9] rounded-[8px] border border-[rgba(34,30,24,0.12)] p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="w-48 h-5" />
                <Skeleton className="w-20 h-5 rounded-full" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#FAF6EE] p-4 rounded border border-[rgba(34,30,24,0.08)] space-y-2">
                  <Skeleton className="w-28 h-3" />
                  <SkeletonText lines={3} />
                </div>
                <div className="bg-[#FAF6EE] p-4 rounded border border-[rgba(34,30,24,0.08)] space-y-2">
                  <Skeleton className="w-28 h-3" />
                  <SkeletonText lines={3} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Skeleton Loader for Revisions & Snapshots Screen
 */
export const RevisionsSkeleton: React.FC = () => {
  return (
    <div className="flex-1 overflow-y-auto bg-[#FAF6EE] p-6 sm:p-10 space-y-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="w-44 h-8" />
            <Skeleton className="w-64 h-4" />
          </div>
          <Skeleton className="w-32 h-9 rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-[#F1EAD9] p-6 rounded-[8px] border border-[rgba(34,30,24,0.12)] space-y-4">
            <Skeleton className="w-36 h-5" />
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="w-4 h-4 rounded" />
                  <Skeleton className="w-full h-4" />
                </div>
              ))}
            </div>
          </div>
          <div className="bg-[#F1EAD9] p-6 rounded-[8px] border border-[rgba(34,30,24,0.12)] space-y-4">
            <Skeleton className="w-32 h-5" />
            <div className="space-y-3">
              <Skeleton className="w-full h-14 rounded" />
              <Skeleton className="w-full h-14 rounded" />
              <Skeleton className="w-full h-14 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Skeleton Loader for Export & Typesetting Screen
 */
export const ExportSkeleton: React.FC = () => {
  return (
    <div className="flex-1 overflow-y-auto bg-[#FAF6EE] p-6 sm:p-10 space-y-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="w-48 h-8" />
            <Skeleton className="w-72 h-4" />
          </div>
          <Skeleton className="w-36 h-10 rounded" />
        </div>
        <div className="bg-[#F1EAD9] p-6 rounded-[8px] border border-[rgba(34,30,24,0.12)] space-y-6">
          <div className="flex gap-3 border-b border-[rgba(34,30,24,0.1)] pb-3">
            <Skeleton className="w-28 h-7 rounded" />
            <Skeleton className="w-28 h-7 rounded" />
            <Skeleton className="w-28 h-7 rounded" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Skeleton className="h-16 rounded" />
            <Skeleton className="h-16 rounded" />
            <Skeleton className="h-16 rounded" />
          </div>
        </div>
        {/* Book Spread Preview Skeleton */}
        <div className="flex justify-center gap-6 pt-4">
          <div className="w-[320px] h-[460px] bg-[#F1EAD9] border border-[#E5DEC9] p-8 space-y-4 shadow-warm-sm">
            <Skeleton className="w-16 h-3 mx-auto" />
            <SkeletonText lines={10} />
          </div>
          <div className="w-[320px] h-[460px] bg-[#F1EAD9] border border-[#E5DEC9] p-8 space-y-4 shadow-warm-sm hidden sm:block">
            <Skeleton className="w-16 h-3 mx-auto" />
            <SkeletonText lines={10} />
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Initial App Booting Skeleton
 */
export const AppBootSkeleton: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-[#FAF6EE] flex flex-col justify-between p-8 z-50 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-[#221E18] flex items-center justify-center text-[#FAF6EE] font-serif font-bold text-sm">
            T
          </div>
          <Skeleton className="w-28 h-5" />
        </div>
        <Skeleton className="w-24 h-5" />
      </div>

      <div className="max-w-md mx-auto w-full text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-[#B54B32]/15 border border-[#B54B32]/30 mx-auto flex items-center justify-center animate-pulse">
          <span className="w-3 h-3 rounded-full bg-[#B54B32]" />
        </div>
        <div className="space-y-2">
          <Skeleton className="w-48 h-6 mx-auto" />
          <Skeleton className="w-64 h-3.5 mx-auto" />
        </div>
      </div>

      <div className="flex justify-between items-center text-xs text-[#7A705F]">
        <Skeleton className="w-32 h-3" />
        <Skeleton className="w-20 h-3" />
      </div>
    </div>
  );
};

/**
 * Universal Screen Skeleton Router Component
 */
export const ScreenSkeletonLoader: React.FC<{ screen: ScreenType }> = ({ screen }) => {
  switch (screen) {
    case 'editor':
      return <EditorSkeleton />;
    case 'projects':
      return <ProjectsSkeleton />;
    case 'editorial':
      return <EditorialSkeleton />;
    case 'dashboard':
      return <DashboardSkeleton />;
    case 'bible':
    case 'codex':
      return <BibleSkeleton />;
    case 'continuity':
      return <ContinuitySkeleton />;
    case 'revisions':
      return <RevisionsSkeleton />;
    case 'export':
      return <ExportSkeleton />;
    case 'home':
    default:
      return <HomeSkeleton />;
  }
};
