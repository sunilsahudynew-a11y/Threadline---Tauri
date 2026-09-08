import React, { useState } from 'react';
import { FrameworkBeatDefinition, FrameworkModel } from '../../data/ideationFrameworks';
import { FrameworkPointer } from '../../types';
import { Sparkles, Plus, Layers, Flame, CheckCircle2, ChevronRight } from 'lucide-react';

interface ThreeActGraphProps {
  framework: FrameworkModel;
  pointers: FrameworkPointer[];
  selectedBeatKey: string | null;
  onSelectBeat: (beatKey: string) => void;
  onAddPointer: (beatKey: string) => void;
}

export const ThreeActGraph: React.FC<ThreeActGraphProps> = ({
  framework,
  pointers,
  selectedBeatKey,
  onSelectBeat,
  onAddPointer
}) => {
  const [hoveredBeatKey, setHoveredBeatKey] = useState<string | null>(null);

  // SVG viewport dimensions
  const width = 960;
  const height = 400;
  const paddingX = 70;
  const paddingY = 60;
  const graphW = width - paddingX * 2;
  const graphH = height - paddingY * 2;

  // Convert beat percent & tension into SVG coordinate space
  // percent: 0..100 -> paddingX .. width - paddingX
  // tensionLevel: 0..100 -> height - paddingY (low) .. paddingY (high tension)
  const getCoords = (beat: FrameworkBeatDefinition) => {
    const x = paddingX + (beat.percent / 100) * graphW;
    const y = height - paddingY - (beat.tensionLevel / 100) * graphH;
    return { x, y };
  };

  const points = framework.beats.map((b) => ({
    beat: b,
    ...getCoords(b)
  }));

  // Construct smooth SVG path using Catmull-Rom or Cubic Beziers
  const generateSmoothPath = () => {
    if (points.length < 2) return '';
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? 0 : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 5;
      const cp1y = p1.y + (p2.y - p0.y) / 5;
      const cp2x = p2.x - (p3.x - p1.x) / 5;
      const cp2y = p2.y - (p3.y - p1.y) / 5;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  };

  const pathD = generateSmoothPath();
  const areaPathD = `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  return (
    <div className="w-full bg-[#FAF6EE] rounded-[10px] border border-[rgba(34,30,24,0.12)] p-4 sm:p-6 shadow-warm-sm select-none relative overflow-hidden">
      {/* Background Graphic Texture & Act Zones */}
      <div className="flex items-center justify-between mb-4 border-b border-[rgba(34,30,24,0.08)] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#B54B32] animate-pulse" />
            <h3 className="text-base sm:text-lg font-serif font-semibold text-[#221E18]">
              {framework.name}
            </h3>
            <span className="text-xs text-[#7A705F] bg-[#F1EAD9] px-2 py-0.5 rounded-[4px] font-mono">
              Dynamic Tension Curve
            </span>
          </div>
          <p className="text-xs text-[#7A705F] mt-0.5">
            Click any beat node along the dramatic curve to inspect craft guidelines and chart custom story pointers.
          </p>
        </div>

        {/* Legend */}
        <div className="hidden sm:flex items-center gap-4 text-xs font-medium text-[#7A705F]">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#B54B32]" />
            <span>High Tension Peak</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#4B6B94]" />
            <span>Setup / Resolution</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#C44900]" />
            <span>Pivots &amp; Reversals</span>
          </div>
        </div>
      </div>

      {/* Mobile Swipe Hint */}
      <div className="sm:hidden flex items-center justify-between text-[10px] font-mono text-[#7A705F] mb-2 px-1">
        <span>Dramatic Tension Curve</span>
        <span className="flex items-center gap-1 text-[#B54B32] font-semibold">
          <span>↔ Swipe to view all beats</span>
        </span>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full overflow-x-auto sm:overflow-x-visible pb-2 no-scrollbar touch-pan-x">
        <div className="min-w-[580px] sm:min-w-0 w-full relative">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto overflow-visible"
            style={{ maxHeight: '420px' }}
          >
            <defs>
              {/* Curve Gradient Fill */}
              <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#B54B32" stopOpacity="0.25" />
                <stop offset="60%" stopColor="#C44900" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#F1EAD9" stopOpacity="0.0" />
              </linearGradient>

              {/* Path Stroke Gradient */}
              <linearGradient id="strokeGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#4B6B94" />
                <stop offset="25%" stopColor="#B54B32" />
                <stop offset="50%" stopColor="#C44900" />
                <stop offset="75%" stopColor="#2F3E46" />
                <stop offset="90%" stopColor="#B54B32" />
                <stop offset="100%" stopColor="#5C746A" />
              </linearGradient>

              {/* Drop Shadow for active nodes */}
              <filter id="nodeGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#B54B32" floodOpacity="0.35" />
              </filter>
            </defs>

            {/* ACT BACKGROUND SECTOR GUIDES */}
            {/* Act I (0 to 25%) */}
            <rect
              x={paddingX}
              y={paddingY}
              width={graphW * 0.25}
              height={graphH}
              fill="rgba(75, 107, 148, 0.03)"
              stroke="rgba(34, 30, 24, 0.08)"
              strokeDasharray="4 4"
            />
            {/* Act II (25% to 75%) */}
            <rect
              x={paddingX + graphW * 0.25}
              y={paddingY}
              width={graphW * 0.5}
              height={graphH}
              fill="rgba(196, 73, 0, 0.02)"
              stroke="rgba(34, 30, 24, 0.08)"
              strokeDasharray="4 4"
            />
            {/* Act III (75% to 100%) */}
            <rect
              x={paddingX + graphW * 0.75}
              y={paddingY}
              width={graphW * 0.25}
              height={graphH}
              fill="rgba(181, 75, 50, 0.03)"
              stroke="rgba(34, 30, 24, 0.08)"
              strokeDasharray="4 4"
            />

            {/* ACT LABELS */}
            <text
              x={paddingX + graphW * 0.125}
              y={paddingY - 14}
              textAnchor="middle"
              className="text-[11px] font-mono uppercase tracking-wider fill-[#7A705F] font-semibold"
            >
              ACT I: SETUP &amp; INCITING
            </text>
            <text
              x={paddingX + graphW * 0.5}
              y={paddingY - 14}
              textAnchor="middle"
              className="text-[11px] font-mono uppercase tracking-wider fill-[#7A705F] font-semibold"
            >
              ACT II: CONFRONTATION &amp; CRISIS
            </text>
            <text
              x={paddingX + graphW * 0.875}
              y={paddingY - 14}
              textAnchor="middle"
              className="text-[11px] font-mono uppercase tracking-wider fill-[#7A705F] font-semibold"
            >
              ACT III: CLIMAX &amp; RESOLUTION
            </text>

            {/* Baseline & Grid lines */}
            <line
              x1={paddingX}
              y1={height - paddingY}
              x2={width - paddingX}
              y2={height - paddingY}
              stroke="rgba(34, 30, 24, 0.2)"
              strokeWidth="1.5"
            />
            {/* 50% Midpoint vertical gridline */}
            <line
              x1={paddingX + graphW * 0.5}
              y1={paddingY}
              x2={paddingX + graphW * 0.5}
              y2={height - paddingY}
              stroke="rgba(196, 73, 0, 0.25)"
              strokeWidth="1"
              strokeDasharray="3 3"
            />

            {/* AREA UNDER CURVE */}
            <path d={areaPathD} fill="url(#curveGradient)" />

            {/* SMOOTH TENSION CURVE */}
            <path
              d={pathD}
              fill="none"
              stroke="url(#strokeGradient)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-all duration-300"
            />

            {/* BEAT NODES & LABELS */}
            {points.map(({ beat, x, y }) => {
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
                  {/* Generous touch target for mobile fingertips */}
                  <circle cx={x} cy={y} r="24" fill="transparent" />

                  {/* Vertical Dropline to Baseline */}
                  <line
                    x1={x}
                    y1={y}
                    x2={x}
                    y2={height - paddingY}
                    stroke={isSelected ? beat.color : 'rgba(34, 30, 24, 0.15)'}
                    strokeWidth={isSelected ? 1.5 : 1}
                    strokeDasharray={isSelected ? 'none' : '2 2'}
                  />

                  {/* Pulsing Outer Halo when Selected */}
                  {isSelected && (
                    <circle
                      cx={x}
                      cy={y}
                      r="16"
                      fill={beat.color}
                      fillOpacity="0.2"
                      className="animate-ping"
                      style={{ animationDuration: '2.5s' }}
                    />
                  )}

                  {/* Outer Ring */}
                  <circle
                    cx={x}
                    cy={y}
                    r={isSelected ? 10 : isHovered ? 8.5 : 7}
                    fill="#FAF6EE"
                    stroke={beat.color}
                    strokeWidth={isSelected ? 3.5 : 2.5}
                    filter={isSelected ? 'url(#nodeGlow)' : undefined}
                    className="transition-all duration-200"
                  />

                  {/* Center Dot */}
                  <circle
                    cx={x}
                    cy={y}
                    r={isSelected ? 5 : 3.5}
                    fill={beat.color}
                    className="transition-all duration-200"
                  />

                  {/* Pointer Count Badge if items attached */}
                  {hasPointers && (
                    <g transform={`translate(${x + 8}, ${y - 12})`}>
                      <circle cx="0" cy="0" r="7" fill="#B54B32" />
                      <text
                        x="0"
                        y="3"
                        textAnchor="middle"
                        className="text-[9px] font-mono font-bold fill-[#FAF6EE]"
                      >
                        {beatPointers.length}
                      </text>
                    </g>
                  )}

                  {/* Label Text */}
                  <text
                    x={x}
                    y={y < height / 2 ? y - 16 : y + 24}
                    textAnchor="middle"
                    className={`text-[11px] font-sans transition-all duration-150 ${
                      isSelected
                        ? 'font-bold fill-[#221E18] text-[12px]'
                        : isHovered
                        ? 'font-semibold fill-[#221E18]'
                        : 'font-medium fill-[#554D40]'
                    }`}
                  >
                    {beat.name}
                  </text>

                  {/* Tension percentage badge */}
                  <text
                    x={x}
                    y={y < height / 2 ? y - 30 : y + 36}
                    textAnchor="middle"
                    className="text-[9px] font-mono fill-[#7A705F]"
                  >
                    {beat.tensionLevel}% tension
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* QUICK BEAT NAV STRIP */}
      <div className="mt-4 pt-3 border-t border-[rgba(34,30,24,0.08)] flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <span className="text-[#7A705F] shrink-0 font-medium mr-1 text-[11px] uppercase tracking-wider font-mono">
          Jump to Beat:
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
