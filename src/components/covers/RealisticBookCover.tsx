import React from 'react';
import { BookCoverTheme, BookCoverLayout, Project } from '../../types';

export interface RealisticBookCoverProps {
  project?: Partial<Project>;
  title?: string;
  subtitle?: string;
  author?: string;
  imprint?: string;
  coverImage?: string;
  theme?: BookCoverTheme;
  layout?: BookCoverLayout;
  accentColor?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
  showSpineCrease?: boolean;
}

// Curated high quality background presets for literary manuscripts
export const COVER_ART_PRESETS = [
  {
    id: 'victorian-botanical',
    name: 'Victorian Conservatory',
    genre: 'Gothic / Mystery',
    bgGradient: 'from-[#1A2E26] via-[#11221B] to-[#0A1612]',
    accentColor: '#D4AF37',
    foilClass: 'text-[#E6CA65]',
    bgImage: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=800&q=80',
    description: 'Lush ferns, antique glasshouse foliage & botanical elegance.'
  },
  {
    id: 'leather-gilt',
    name: 'Gilded Antiquarian',
    genre: 'Historical / Classics',
    bgGradient: 'from-[#2A1B14] via-[#1F130E] to-[#120B08]',
    accentColor: '#E5C158',
    foilClass: 'text-[#F3D77B]',
    bgImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
    description: 'Aged buckram bookcloth with gold foil filigree.'
  },
  {
    id: 'celestial-ink',
    name: 'Celestial Astrolabe',
    genre: 'Sci-Fi / Fantasy',
    bgGradient: 'from-[#10192B] via-[#0B1120] to-[#050811]',
    accentColor: '#93C5FD',
    foilClass: 'text-[#BAE6FD]',
    bgImage: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=800&q=80',
    description: 'Deep midnight navy with stellar constellations and star charts.'
  },
  {
    id: 'crimson-velvet',
    name: 'Burgundy Noir',
    genre: 'Thriller / Drama',
    bgGradient: 'from-[#3B1219] via-[#26090F] to-[#160408]',
    accentColor: '#F59E0B',
    foilClass: 'text-[#FCD34D]',
    bgImage: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
    description: 'Rich theatrical velvet with dramatic shadow and gold typography.'
  },
  {
    id: 'noir-minimal',
    name: 'Obsidian Minimalist',
    genre: 'Literary / Modern',
    bgGradient: 'from-[#1C1B19] via-[#141311] to-[#0A0A09]',
    accentColor: '#E2E8F0',
    foilClass: 'text-[#F8FAFC]',
    bgImage: '',
    description: 'Matte black architectural styling with stark letterspacing.'
  },
  {
    id: 'antique-linen',
    name: 'Natural Oatmeal Cloth',
    genre: 'Memoir / Essay',
    bgGradient: 'from-[#F5EFE1] via-[#E8DEC7] to-[#D5C7AA]',
    accentColor: '#6B4F3B',
    foilClass: 'text-[#4A3525]',
    bgImage: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=800&q=80',
    description: 'Warm textured book linen with letterpress ink imprint.'
  }
];

export const RealisticBookCover: React.FC<RealisticBookCoverProps> = ({
  project,
  title: propTitle,
  subtitle: propSubtitle,
  author: propAuthor,
  imprint: propImprint,
  coverImage: propCoverImage,
  theme: propTheme,
  layout: propLayout,
  accentColor: propAccentColor,
  size = 'md',
  className = '',
  onClick,
  showSpineCrease = true
}) => {
  const title = propTitle || project?.coverTitle || project?.title || 'Untitled Manuscript';
  const subtitle = propSubtitle || project?.coverSubtitle || project?.genre || 'A Novel';
  const author = propAuthor || project?.coverAuthor || project?.author || 'Author Name';
  const imprint = propImprint || project?.coverImprint || 'THREADLINE EDITIONS';
  const coverImage = propCoverImage !== undefined ? propCoverImage : project?.coverImage;
  const theme = propTheme || project?.coverTheme || 'antique-linen';
  const layout = propLayout || project?.coverLayout || 'classical-frame';
  const accentColor = propAccentColor || project?.coverAccentColor || '#D4AF37';

  // Size dimensions (6x9 aspect ratio: approx 1 : 1.5)
  const sizeClasses = {
    sm: 'w-24 h-36 text-[8px]',
    md: 'w-36 h-54 sm:w-40 sm:h-60 text-[10px]',
    lg: 'w-52 h-78 sm:w-60 sm:h-90 text-xs',
    xl: 'w-72 h-[432px] sm:w-80 sm:h-[480px] text-sm'
  }[size];

  // Preset match
  const preset = COVER_ART_PRESETS.find((p) => p.id === theme) || COVER_ART_PRESETS[0];
  const activeBgImage = coverImage || preset.bgImage;
  const isLightBackground = theme === 'antique-linen' && !coverImage;

  return (
    <div
      onClick={onClick}
      className={`relative select-none overflow-hidden rounded-[4px] shadow-2xl transition-all duration-300 group ${
        onClick ? 'cursor-pointer hover:-translate-y-1 hover:shadow-black/30' : ''
      } ${sizeClasses} ${className}`}
      style={{
        aspectRatio: '2 / 3',
        boxShadow:
          '0 12px 28px -6px rgba(0, 0, 0, 0.35), 0 4px 10px -2px rgba(0, 0, 0, 0.2), inset 0 0 0 1px rgba(255, 255, 255, 0.1)'
      }}
    >
      {/* Background Layer: Image or Gradient */}
      {activeBgImage ? (
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
          style={{ backgroundImage: `url(${activeBgImage})` }}
        >
          {/* Tone overlay to guarantee typography legibility */}
          <div
            className={`absolute inset-0 ${
              isLightBackground
                ? 'bg-amber-950/20 mix-blend-multiply'
                : 'bg-gradient-to-t from-black/85 via-black/45 to-black/60'
            }`}
          />
        </div>
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-b ${preset.bgGradient}`} />
      )}

      {/* Realistic Book Spine Crease & Shadow */}
      {showSpineCrease && (
        <>
          {/* Left spine shadow & crease highlight */}
          <div className="absolute left-0 top-0 bottom-0 w-3.5 bg-gradient-to-r from-black/50 via-black/20 to-transparent pointer-events-none z-20" />
          <div className="absolute left-3.5 top-0 bottom-0 w-[1.5px] bg-white/15 pointer-events-none z-20" />
          {/* Outer edge burnish */}
          <div className="absolute inset-0 border border-white/15 rounded-[4px] pointer-events-none z-20" />
          {/* Subtle paper / leather grain texture overlay */}
          <div
            className="absolute inset-0 opacity-[0.07] mix-blend-overlay pointer-events-none z-10"
            style={{
              backgroundImage:
                'radial-gradient(circle at 50% 50%, #fff 1px, transparent 1px)',
              backgroundSize: '8px 8px'
            }}
          />
        </>
      )}

      {/* Front Cover Typography & Framing Layouts */}
      <div className="relative z-10 h-full w-full flex flex-col justify-between p-3.5 sm:p-5">
        {layout === 'classical-frame' && (
          <div className="h-full w-full border border-amber-300/40 rounded-[2px] p-2.5 flex flex-col justify-between relative">
            {/* Corner flourishes */}
            <div className="absolute top-1 left-1 w-2 h-2 border-t-2 border-l-2 border-amber-300/60" />
            <div className="absolute top-1 right-1 w-2 h-2 border-t-2 border-r-2 border-amber-300/60" />
            <div className="absolute bottom-1 left-1 w-2 h-2 border-b-2 border-l-2 border-amber-300/60" />
            <div className="absolute bottom-1 right-1 w-2 h-2 border-b-2 border-r-2 border-amber-300/60" />

            {/* Top: Genre / Subtitle */}
            <div className="text-center pt-2">
              <span
                className="font-sans uppercase tracking-[0.25em] text-[7px] sm:text-[9px] font-semibold opacity-85"
                style={{ color: accentColor }}
              >
                {subtitle}
              </span>
            </div>

            {/* Center: Title */}
            <div className="text-center px-1 my-auto space-y-1">
              <h1
                className="font-serif font-bold leading-tight tracking-wide drop-shadow-md line-clamp-3 text-white"
                style={{
                  fontSize: size === 'sm' ? '11px' : size === 'md' ? '15px' : size === 'lg' ? '20px' : '26px'
                }}
              >
                {title}
              </h1>
              <div
                className="w-10 h-0.5 mx-auto opacity-70 my-2"
                style={{ backgroundColor: accentColor }}
              />
            </div>

            {/* Bottom: Author & Imprint */}
            <div className="text-center pb-1 space-y-1">
              <div className="font-serif italic font-medium tracking-wide text-[9px] sm:text-[11px] text-white/95">
                {author}
              </div>
              <div
                className="text-[6px] sm:text-[7px] uppercase tracking-[0.2em] font-mono opacity-65"
                style={{ color: accentColor }}
              >
                {imprint}
              </div>
            </div>
          </div>
        )}

        {layout === 'split-band' && (
          <div className="h-full w-full flex flex-col justify-between py-2">
            <div className="text-center pt-2">
              <div
                className="text-[7px] sm:text-[8px] uppercase tracking-[0.2em] font-sans font-semibold"
                style={{ color: accentColor }}
              >
                {imprint}
              </div>
            </div>

            {/* Center horizontal band */}
            <div className="bg-black/75 backdrop-blur-sm -mx-3.5 sm:-mx-5 py-3 px-4 border-y border-white/20 text-center space-y-1 my-auto shadow-lg">
              <h1
                className="font-serif font-bold text-white tracking-wide leading-tight line-clamp-2"
                style={{
                  fontSize: size === 'sm' ? '12px' : size === 'md' ? '16px' : size === 'lg' ? '22px' : '28px'
                }}
              >
                {title}
              </h1>
              <p
                className="text-[7px] sm:text-[9px] uppercase tracking-[0.18em] font-sans font-medium"
                style={{ color: accentColor }}
              >
                {subtitle}
              </p>
            </div>

            <div className="text-center pb-2">
              <div className="font-serif italic text-white/95 text-[9px] sm:text-[11px] font-medium">
                {author}
              </div>
            </div>
          </div>
        )}

        {layout === 'minimalist-centered' && (
          <div className="h-full w-full flex flex-col justify-between py-3 text-center">
            <div
              className="text-[6px] sm:text-[8px] uppercase tracking-[0.3em] font-mono opacity-80"
              style={{ color: accentColor }}
            >
              {subtitle}
            </div>

            <div className="my-auto space-y-3 px-1">
              <h1
                className="font-serif font-light tracking-[0.12em] text-white uppercase leading-snug line-clamp-3"
                style={{
                  fontSize: size === 'sm' ? '10px' : size === 'md' ? '14px' : size === 'lg' ? '18px' : '24px'
                }}
              >
                {title}
              </h1>
              <div className="w-6 h-px bg-white/30 mx-auto" />
              <p className="font-serif italic text-[8px] sm:text-[10px] text-white/85">
                by {author}
              </p>
            </div>

            <div
              className="text-[6px] sm:text-[7px] uppercase tracking-[0.25em] font-mono opacity-70"
              style={{ color: accentColor }}
            >
              {imprint}
            </div>
          </div>
        )}

        {layout === 'ornamental-crest' && (
          <div className="h-full w-full border-2 border-double border-amber-300/50 p-2 flex flex-col justify-between text-center">
            {/* Ornamental Crest Header */}
            <div className="pt-2 flex flex-col items-center">
              <div className="w-5 h-5 rounded-full border border-amber-300/70 flex items-center justify-center text-[8px] text-amber-200 font-serif">
                ✦
              </div>
              <span
                className="text-[6px] sm:text-[8px] uppercase tracking-[0.2em] font-sans mt-1"
                style={{ color: accentColor }}
              >
                {subtitle}
              </span>
            </div>

            <div className="my-auto space-y-2 px-1">
              <h1
                className="font-serif font-bold text-white leading-tight tracking-wider line-clamp-3"
                style={{
                  fontSize: size === 'sm' ? '11px' : size === 'md' ? '15px' : size === 'lg' ? '20px' : '26px'
                }}
              >
                {title}
              </h1>
              <div className="text-[8px] text-amber-300/80">❦</div>
            </div>

            <div className="pb-1 space-y-1">
              <div className="font-serif font-medium text-white/95 text-[9px] sm:text-[11px] tracking-wide">
                {author}
              </div>
              <div
                className="text-[6px] sm:text-[7px] uppercase tracking-[0.2em] font-mono opacity-70"
                style={{ color: accentColor }}
              >
                {imprint}
              </div>
            </div>
          </div>
        )}

        {layout === 'full-bleed' && (
          <div className="h-full w-full flex flex-col justify-between text-left py-1">
            <div
              className="text-[7px] sm:text-[8px] uppercase tracking-[0.2em] font-mono font-semibold"
              style={{ color: accentColor }}
            >
              {subtitle}
            </div>

            <div className="my-auto space-y-1.5 pr-2">
              <h1
                className="font-serif font-extrabold text-white leading-none tracking-tight line-clamp-3 drop-shadow-lg"
                style={{
                  fontSize: size === 'sm' ? '13px' : size === 'md' ? '18px' : size === 'lg' ? '24px' : '32px'
                }}
              >
                {title}
              </h1>
              <div
                className="w-12 h-1 rounded-full"
                style={{ backgroundColor: accentColor }}
              />
            </div>

            <div className="pt-2 border-t border-white/20 flex items-center justify-between">
              <span className="font-serif italic text-white font-medium text-[8px] sm:text-[10px]">
                {author}
              </span>
              <span
                className="text-[6px] sm:text-[7px] uppercase tracking-[0.15em] font-mono opacity-80"
                style={{ color: accentColor }}
              >
                {imprint}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
