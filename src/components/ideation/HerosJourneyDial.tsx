import React, { useState } from 'react';
import { FrameworkModel, FrameworkBeatDefinition } from '../../data/ideationFrameworks';
import { FrameworkPointer } from '../../types';
import { Compass, Sparkles, Plus, Orbit, ShieldAlert } from 'lucide-react';

interface HerosJourneyDialProps {
  framework: FrameworkModel;
  pointers: FrameworkPointer[];
  selectedBeatKey: string | null;
  onSelectBeat: (beatKey: string) => void;
  onAddPointer: (beatKey: string) => void;
}

export const HerosJourneyDial: React.FC<HerosJourneyDialProps> = ({
  framework,
  pointers,
  selectedBeatKey,
  onSelectBeat,
  onAddPointer
}) => {
  const [hoveredBeatKey, setHoveredBeatKey] = useState<string | null>(null);

  // SVG dimensions
  const size = 680;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 230;

  // Convert angle in degrees to (x, y) coordinates
  const getRadialCoords = (angleDeg: number, r: number = radius) => {
    const rad = (angleDeg * Math.PI) / 180;
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad)
    };
  };

  return (
    <div className="w-full bg-[#FAF6EE] rounded-[10px] border border-[rgba(34,30,24,0.12)] p-4 sm:p-6 shadow-warm-sm select-none relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-[rgba(34,30,24,0.08)] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#3A7D6E] animate-pulse" />
            <h3 className="text-base sm:text-lg font-serif font-semibold text-[#221E18]">
              {framework.name}
            </h3>
            <span className="text-xs text-[#7A705F] bg-[#F1EAD9] px-2 py-0.5 rounded-[4px] font-mono">
              12-Stage Circular Monomyth Dial
            </span>
          </div>
          <p className="text-xs text-[#7A705F] mt-0.5">
            The monomyth cycle crossing the horizontal threshold between the Known Ordinary World and the Unknown Special World.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs font-medium text-[#7A705F]">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#4B6B94]" />
            <span>Departure (Upper)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#B54B32]" />
            <span>Initiation / Ordeal (Lower)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#3A7D6E]" />
            <span>Return (Ascent)</span>
          </div>
        </div>
      </div>

      {/* Circular SVG Stage */}
      <div className="flex justify-center items-center py-2 overflow-x-auto">
        <div className="relative min-w-[560px] max-w-[680px]">
          <svg
            viewBox={`0 0 ${size} ${size}`}
            className="w-full h-auto overflow-visible select-none"
          >
            <defs>
              {/* Radial glow for center */}
              <radialGradient id="dialGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#F1EAD9" stopOpacity="0.8" />
                <stop offset="70%" stopColor="#FAF6EE" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#FAF6EE" stopOpacity="0" />
              </radialGradient>

              {/* Special world subtle tint for bottom half */}
              <linearGradient id="specialWorldTint" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(181, 75, 50, 0.0)" />
                <stop offset="100%" stopColor="rgba(181, 75, 50, 0.07)" />
              </linearGradient>

              {/* Ordinary world subtle tint for top half */}
              <linearGradient id="ordinaryWorldTint" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="rgba(75, 107, 148, 0.0)" />
                <stop offset="100%" stopColor="rgba(75, 107, 148, 0.05)" />
              </linearGradient>
            </defs>

            {/* UPPER HEMISPHERE: ORDINARY WORLD BACKGROUND */}
            <path
              d={`M ${cx - radius - 30} ${cy} A ${radius + 30} ${radius + 30} 0 0 1 ${cx + radius + 30} ${cy} Z`}
              fill="url(#ordinaryWorldTint)"
            />

            {/* LOWER HEMISPHERE: SPECIAL WORLD BACKGROUND */}
            <path
              d={`M ${cx - radius - 30} ${cy} A ${radius + 30} ${radius + 30} 0 0 0 ${cx + radius + 30} ${cy} Z`}
              fill="url(#specialWorldTint)"
            />

            {/* THRESHOLD HORIZON DIVIDER (Dashed Line between Known & Unknown) */}
            <line
              x1={cx - radius - 45}
              y1={cy}
              x2={cx + radius + 45}
              y2={cy}
              stroke="rgba(34, 30, 24, 0.25)"
              strokeWidth="2"
              strokeDasharray="6 4"
            />
            {/* Left & Right Threshold Labels */}
            <text
              x={cx - radius - 48}
              y={cy - 8}
              textAnchor="end"
              className="text-[10px] font-mono fill-[#7A705F] font-bold uppercase"
            >
              Threshold
            </text>
            <text
              x={cx - radius - 48}
              y={cy + 14}
              textAnchor="end"
              className="text-[9px] font-mono fill-[#B54B32] font-semibold uppercase"
            >
              (Return)
            </text>

            <text
              x={cx + radius + 48}
              y={cy - 8}
              textAnchor="start"
              className="text-[10px] font-mono fill-[#7A705F] font-bold uppercase"
            >
              Threshold
            </text>
            <text
              x={cx + radius + 48}
              y={cy + 14}
              textAnchor="start"
              className="text-[9px] font-mono fill-[#B54B32] font-semibold uppercase"
            >
              (Descent)
            </text>

            {/* ZONE LABELS */}
            <text
              x={cx}
              y={cy - 90}
              textAnchor="middle"
              className="text-[11px] font-mono uppercase tracking-widest fill-[#7A705F] font-bold opacity-75"
            >
              THE KNOWN ORDINARY WORLD
            </text>
            <text
              x={cx}
              y={cy + 105}
              textAnchor="middle"
              className="text-[11px] font-mono uppercase tracking-widest fill-[#B54B32] font-bold opacity-80"
            >
              THE UNKNOWN SPECIAL WORLD (ABYSS)
            </text>

            {/* ORBITAL CIRCLE TRACKS */}
            <circle
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke="rgba(34, 30, 24, 0.15)"
              strokeWidth="2"
            />

            {/* Animated dashed inner ring */}
            <circle
              cx={cx}
              cy={cy}
              r={radius - 40}
              fill="none"
              stroke="rgba(34, 30, 24, 0.08)"
              strokeWidth="1"
              strokeDasharray="4 6"
              className="animate-spin"
              style={{ transformOrigin: 'center', animationDuration: '90s' }}
            />

            {/* Outer dotted accent ring */}
            <circle
              cx={cx}
              cy={cy}
              r={radius + 30}
              fill="none"
              stroke="rgba(34, 30, 24, 0.06)"
              strokeWidth="1"
              strokeDasharray="2 8"
            />

            {/* CENTER COMPASS HUB */}
            <circle cx={cx} cy={cy} r="48" fill="#FAF6EE" stroke="rgba(34, 30, 24, 0.15)" strokeWidth="1.5" />
            <circle cx={cx} cy={cy} r="40" fill="url(#dialGlow)" />
            <text
              x={cx}
              y={cy - 6}
              textAnchor="middle"
              className="text-[12px] font-serif font-bold fill-[#221E18]"
            >
              MONOMYTH
            </text>
            <text
              x={cx}
              y={cy + 12}
              textAnchor="middle"
              className="text-[9px] font-mono fill-[#7A705F]"
            >
              12 STAGES
            </text>

            {/* STAGE NODES AROUND THE CIRCULAR DIAL */}
            {framework.beats.map((beat, idx) => {
              const angle = beat.angleDeg !== undefined ? beat.angleDeg : (idx * 360) / framework.beats.length - 90;
              const { x, y } = getRadialCoords(angle, radius);
              const labelCoords = getRadialCoords(angle, radius + 32);

              const isSelected = selectedBeatKey === beat.key;
              const isHovered = hoveredBeatKey === beat.key;
              const beatPointers = pointers.filter((p) => p.beatKey === beat.key);
              const hasPointers = beatPointers.length > 0;

              return (
                <g
                  key={beat.key}
                  className="cursor-pointer group"
                  onClick={() => onSelectBeat(beat.key)}
                  onMouseEnter={() => setHoveredBeatKey(beat.key)}
                  onMouseLeave={() => setHoveredBeatKey(null)}
                >
                  {/* Radial spoke from center to node */}
                  <line
                    x1={cx}
                    y1={cy}
                    x2={x}
                    y2={y}
                    stroke={isSelected ? beat.color : 'rgba(34, 30, 24, 0.08)'}
                    strokeWidth={isSelected ? 1.5 : 0.8}
                    strokeDasharray={isSelected ? 'none' : '2 3'}
                  />

                  {/* Pulsing ring if selected */}
                  {isSelected && (
                    <circle
                      cx={x}
                      cy={y}
                      r="20"
                      fill={beat.color}
                      fillOpacity="0.25"
                      className="animate-ping"
                      style={{ animationDuration: '2.5s' }}
                    />
                  )}

                  {/* Node Outer Circle */}
                  <circle
                    cx={x}
                    cy={y}
                    r={isSelected ? 14 : isHovered ? 12 : 10}
                    fill="#FAF6EE"
                    stroke={beat.color}
                    strokeWidth={isSelected ? 3.5 : 2.5}
                    className="transition-all duration-200"
                  />

                  {/* Node Number inside circle */}
                  <text
                    x={x}
                    y={y + 3.5}
                    textAnchor="middle"
                    className={`text-[10px] font-mono font-bold ${
                      isSelected ? 'fill-[#B54B32]' : 'fill-[#221E18]'
                    }`}
                  >
                    {idx + 1}
                  </text>

                  {/* Pointer badge if attached */}
                  {hasPointers && (
                    <g transform={`translate(${x + 9}, ${y - 9})`}>
                      <circle cx="0" cy="0" r="6.5" fill="#B54B32" />
                      <text
                        x="0"
                        y="3"
                        textAnchor="middle"
                        className="text-[8px] font-mono font-bold fill-white"
                      >
                        {beatPointers.length}
                      </text>
                    </g>
                  )}

                  {/* Stage Name Outside the Circle */}
                  <text
                    x={labelCoords.x}
                    y={labelCoords.y}
                    textAnchor={
                      Math.abs(labelCoords.x - cx) < 20
                        ? 'middle'
                        : labelCoords.x > cx
                        ? 'start'
                        : 'end'
                    }
                    className={`text-[11px] font-sans transition-all duration-150 ${
                      isSelected
                        ? 'font-bold fill-[#221E18] text-[12px]'
                        : isHovered
                        ? 'font-semibold fill-[#221E18]'
                        : 'font-medium fill-[#554D40]'
                    }`}
                  >
                    {beat.name.replace(/^\d+\.\s*/, '')}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* QUICK STAGE SELECTOR ROW */}
      <div className="mt-4 pt-3 border-t border-[rgba(34,30,24,0.08)] flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <span className="text-[#7A705F] shrink-0 font-medium mr-1 text-[11px] uppercase tracking-wider font-mono">
          Jump to Stage:
        </span>
        {framework.beats.map((beat) => {
          const isSelected = selectedBeatKey === beat.key;
          const beatPointers = pointers.filter((p) => p.beatKey === beat.key);

          return (
            <button
              key={beat.key}
              onClick={() => onSelectBeat(beat.key)}
              className={`px-2.5 py-1 rounded-[5px] text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer border ${
                isSelected
                  ? 'bg-[#221E18] text-[#FAF6EE] border-[#221E18]'
                  : 'bg-[#F1EAD9] text-[#554D40] hover:text-[#221E18] hover:bg-[#E8DFC9] border-[rgba(34,30,24,0.08)]'
              }`}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: beat.color }}
              />
              <span>{beat.name}</span>
              {beatPointers.length > 0 && (
                <span
                  className={`text-[10px] px-1 rounded-full font-mono ${
                    isSelected ? 'bg-[#B54B32] text-white' : 'bg-[#E0D5BE] text-[#221E18]'
                  }`}
                >
                  {beatPointers.length}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
