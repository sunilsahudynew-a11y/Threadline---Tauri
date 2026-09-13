import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Upload,
  Image as ImageIcon,
  Palette,
  Type,
  Sparkles,
  Check,
  RotateCcw,
  BookOpen,
  Sliders,
  Trash2
} from 'lucide-react';
import { Project, BookCoverTheme, BookCoverLayout } from '../../types';
import { RealisticBookCover, COVER_ART_PRESETS } from './RealisticBookCover';

interface BookCoverDesignerModalProps {
  isOpen: boolean;
  project: Project;
  onClose: () => void;
  onSaveCover: (updatedProjectFields: Partial<Project>) => void;
}

export const BookCoverDesignerModal: React.FC<BookCoverDesignerModalProps> = ({
  isOpen,
  project,
  onClose,
  onSaveCover
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'upload' | 'typography' | 'layout'>('presets');

  // Working state
  const [coverImage, setCoverImage] = useState<string | undefined>(project.coverImage);
  const [theme, setTheme] = useState<BookCoverTheme>(project.coverTheme || 'victorian-botanical');
  const [layout, setLayout] = useState<BookCoverLayout>(project.coverLayout || 'classical-frame');
  const [title, setTitle] = useState(project.coverTitle || project.title || '');
  const [subtitle, setSubtitle] = useState(project.coverSubtitle || project.genre || 'A Novel');
  const [author, setAuthor] = useState(project.coverAuthor || project.author || 'Author Name');
  const [imprint, setImprint] = useState(project.coverImprint || 'THREADLINE EDITIONS');
  const [accentColor, setAccentColor] = useState(project.coverAccentColor || '#D4AF37');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  if (!isOpen) return null;

  const handleImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setCoverImage(dataUrl);
      setTheme('custom-art');
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    onSaveCover({
      coverImage,
      coverTheme: theme,
      coverLayout: layout,
      coverTitle: title,
      coverSubtitle: subtitle,
      coverAuthor: author,
      coverImprint: imprint,
      coverAccentColor: accentColor
    });
    onClose();
  };

  const handleReset = () => {
    setCoverImage(undefined);
    setTheme('antique-linen');
    setLayout('classical-frame');
    setTitle(project.title || '');
    setSubtitle(project.genre || 'A Novel');
    setAuthor(project.author || 'Author Name');
    setImprint('THREADLINE EDITIONS');
    setAccentColor('#D4AF37');
  };

  const FOIL_COLORS = [
    { name: 'Antique Gold', hex: '#D4AF37' },
    { name: 'Warm Amber', hex: '#F59E0B' },
    { name: 'Silver Leaf', hex: '#E2E8F0' },
    { name: 'Copper Foil', hex: '#E07A5F' },
    { name: 'Emerald Gilt', hex: '#10B981' },
    { name: 'Rose Gold', hex: '#FB7185' }
  ];

  const LAYOUT_OPTIONS: { id: BookCoverLayout; label: string; desc: string }[] = [
    {
      id: 'classical-frame',
      label: 'Classical Double-Frame',
      desc: 'Ornate borders with corner flourishes and centered title hierarchy.'
    },
    {
      id: 'split-band',
      label: 'Horizontal Author Band',
      desc: 'Dramatic darkened band across artwork for crisp title legibility.'
    },
    {
      id: 'minimalist-centered',
      label: 'Minimalist Monolith',
      desc: 'Expansive negative space, airy tracking, and disciplined typography.'
    },
    {
      id: 'ornamental-crest',
      label: 'Ornamental Crest',
      desc: 'Double-rule framing with centered colophon insignia and literary floral motif.'
    },
    {
      id: 'full-bleed',
      label: 'Full Bleed Modern',
      desc: 'Bold display typography grounded by an accent underline rule.'
    }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative bg-[#FAF6EE] w-full max-w-4xl max-h-[92vh] rounded-[10px] border border-[rgba(34,30,24,0.15)] shadow-2xl flex flex-col overflow-hidden z-10"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-[#E5DEC9] bg-[#F1EAD9] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#B54B32]/10 border border-[#B54B32]/30 flex items-center justify-center text-[#B54B32]">
                <BookOpen size={16} />
              </div>
              <div>
                <h2 className="font-serif text-lg font-bold text-[#221E18] tracking-tight">
                  Book Cover Studio
                </h2>
                <p className="text-xs text-[#7A705F]">
                  Typeset a physical 3D book cover for &ldquo;{project.title}&rdquo;
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-[#7A705F] hover:text-[#221E18] hover:bg-[#E5DEC9] rounded-md transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Main Body: Split between 3D Preview (Left) and Customizer Controls (Right) */}
          <div className="flex-1 overflow-y-auto flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-[#E5DEC9]">
            {/* LEFT: Live 3D Cover Canvas Preview */}
            <div className="w-full md:w-[46%] p-6 sm:p-8 bg-[#F4EFE3] flex flex-col items-center justify-center space-y-4">
              <div className="text-center space-y-1">
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#7A705F] font-semibold">
                  Live 3D Proof
                </span>
              </div>

              {/* The 3D Cover */}
              <div className="my-auto py-2">
                <RealisticBookCover
                  size="xl"
                  title={title}
                  subtitle={subtitle}
                  author={author}
                  imprint={imprint}
                  coverImage={coverImage}
                  theme={theme}
                  layout={layout}
                  accentColor={accentColor}
                  showSpineCrease={true}
                  className="shadow-2xl hover:scale-[1.02] transition-transform duration-300"
                />
              </div>

              <div className="text-[11px] text-[#7A705F] text-center max-w-xs italic font-serif">
                Renders in Typeset Book Exports, PDF distribution &amp; project cards
              </div>
            </div>

            {/* RIGHT: Customization Tabs & Controls */}
            <div className="w-full md:w-[54%] p-6 flex flex-col overflow-y-auto space-y-5 bg-[#FAF6EE]">
              {/* Category Tabs */}
              <div className="flex border-b border-[#E5DEC9] gap-1 pb-1 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveTab('presets')}
                  className={`px-3 py-2 rounded-t font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'presets'
                      ? 'bg-[#FAF6EE] text-[#B54B32] border-b-2 border-[#B54B32] font-semibold'
                      : 'text-[#7A705F] hover:text-[#221E18]'
                  }`}
                >
                  <Palette size={13} />
                  Art Presets
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('upload')}
                  className={`px-3 py-2 rounded-t font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'upload'
                      ? 'bg-[#FAF6EE] text-[#B54B32] border-b-2 border-[#B54B32] font-semibold'
                      : 'text-[#7A705F] hover:text-[#221E18]'
                  }`}
                >
                  <Upload size={13} />
                  Upload Art
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('layout')}
                  className={`px-3 py-2 rounded-t font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'layout'
                      ? 'bg-[#FAF6EE] text-[#B54B32] border-b-2 border-[#B54B32] font-semibold'
                      : 'text-[#7A705F] hover:text-[#221E18]'
                  }`}
                >
                  <Sliders size={13} />
                  Framing Layout
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('typography')}
                  className={`px-3 py-2 rounded-t font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'typography'
                      ? 'bg-[#FAF6EE] text-[#B54B32] border-b-2 border-[#B54B32] font-semibold'
                      : 'text-[#7A705F] hover:text-[#221E18]'
                  }`}
                >
                  <Type size={13} />
                  Typography
                </button>
              </div>

              {/* TAB 1: Art Presets */}
              {activeTab === 'presets' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#221E18]">
                      Curated Literary Cover Presets
                    </span>
                    {coverImage && (
                      <button
                        type="button"
                        onClick={() => setCoverImage(undefined)}
                        className="text-[11px] text-[#B54B32] hover:underline flex items-center gap-1"
                      >
                        <Trash2 size={12} /> Clear uploaded art
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {COVER_ART_PRESETS.map((p) => {
                      const isSelected = theme === p.id && !coverImage;
                      return (
                        <div
                          key={p.id}
                          onClick={() => {
                            setTheme(p.id as BookCoverTheme);
                            setCoverImage(undefined);
                            setAccentColor(p.accentColor);
                          }}
                          className={`p-3 rounded-lg border text-left cursor-pointer transition-all flex flex-col justify-between h-28 relative overflow-hidden ${
                            isSelected
                              ? 'border-[#B54B32] ring-2 ring-[#B54B32]/30 bg-[#F1EAD9]'
                              : 'border-[#E5DEC9] bg-[#F6F1E6] hover:border-[#D5CAA8]'
                          }`}
                        >
                          {p.bgImage ? (
                            <div
                              className="absolute inset-0 bg-cover bg-center opacity-30"
                              style={{ backgroundImage: `url(${p.bgImage})` }}
                            />
                          ) : (
                            <div
                              className={`absolute inset-0 bg-gradient-to-br ${p.bgGradient} opacity-30`}
                            />
                          )}

                          <div className="relative z-10 space-y-1">
                            <span className="text-[9px] uppercase tracking-wider font-mono text-[#7A705F] font-semibold">
                              {p.genre}
                            </span>
                            <h4 className="font-serif font-bold text-xs text-[#221E18] leading-tight">
                              {p.name}
                            </h4>
                          </div>

                          <p className="relative z-10 text-[10px] text-[#7A705F] line-clamp-2 leading-relaxed">
                            {p.description}
                          </p>

                          {isSelected && (
                            <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#B54B32] text-white flex items-center justify-center text-[10px] shadow z-20">
                              ✓
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Metallic Foil Accent Picker */}
                  <div className="pt-2 border-t border-[#E5DEC9] space-y-2">
                    <span className="text-xs font-semibold text-[#221E18]">
                      Embossed Metallic Foil Hue
                    </span>
                    <div className="flex gap-2 flex-wrap">
                      {FOIL_COLORS.map((c) => (
                        <button
                          key={c.hex}
                          type="button"
                          onClick={() => setAccentColor(c.hex)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border transition-all cursor-pointer ${
                            accentColor === c.hex
                              ? 'border-[#221E18] ring-2 ring-black/10 font-semibold bg-white'
                              : 'border-[#E5DEC9] bg-[#FAF6EE] text-[#7A705F] hover:text-[#221E18]'
                          }`}
                        >
                          <span
                            className="w-3 h-3 rounded-full border border-black/20"
                            style={{ backgroundColor: c.hex }}
                          />
                          {c.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Upload Custom Art */}
              {activeTab === 'upload' && (
                <div className="space-y-4">
                  <span className="text-xs font-semibold text-[#221E18]">
                    Upload Custom Front Cover Artwork
                  </span>

                  {/* Dropzone */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOver(false);
                      if (e.dataTransfer.files?.[0]) {
                        handleImageFile(e.dataTransfer.files[0]);
                      }
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all space-y-3 ${
                      dragOver
                        ? 'border-[#B54B32] bg-[#B54B32]/5'
                        : 'border-[#E5DEC9] bg-[#F6F1E6] hover:border-[#B54B32]/60'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleImageFile(e.target.files[0]);
                        }
                      }}
                    />

                    <div className="w-12 h-12 rounded-full bg-[#B54B32]/10 mx-auto flex items-center justify-center text-[#B54B32]">
                      <Upload size={20} />
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-[#221E18]">
                        Click to browse or drag &amp; drop artwork image
                      </p>
                      <p className="text-[11px] text-[#7A705F]">
                        Supports PNG, JPG, WebP. Recommended ratio: 2:3 (e.g. 1600 × 2400)
                      </p>
                    </div>
                  </div>

                  {coverImage && (
                    <div className="p-3 bg-[#F1EAD9] rounded-lg border border-[#E5DEC9] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={coverImage}
                          alt="Cover thumbnail"
                          className="w-12 h-16 object-cover rounded shadow-sm border border-black/10"
                        />
                        <div className="space-y-0.5">
                          <span className="text-xs font-semibold text-[#221E18]">
                            Custom Image Applied
                          </span>
                          <p className="text-[11px] text-[#7A705F]">
                            Front cover will render this artwork in 3D perspective
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setCoverImage(undefined)}
                        className="px-3 py-1.5 text-xs text-[#B54B32] hover:bg-rose-50 rounded border border-[#B54B32]/30 cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: Layout Options */}
              {activeTab === 'layout' && (
                <div className="space-y-4">
                  <span className="text-xs font-semibold text-[#221E18]">
                    Choose Front Cover Framing Layout
                  </span>

                  <div className="space-y-2.5">
                    {LAYOUT_OPTIONS.map((opt) => {
                      const isSelected = layout === opt.id;
                      return (
                        <div
                          key={opt.id}
                          onClick={() => setLayout(opt.id)}
                          className={`p-3.5 rounded-lg border text-left cursor-pointer transition-all flex items-start gap-3.5 ${
                            isSelected
                              ? 'border-[#B54B32] ring-2 ring-[#B54B32]/25 bg-[#F1EAD9]'
                              : 'border-[#E5DEC9] bg-[#F6F1E6] hover:border-[#D5CAA8]'
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center text-[9px] shrink-0 ${
                              isSelected
                                ? 'border-[#B54B32] bg-[#B54B32] text-white'
                                : 'border-[#7A705F]'
                            }`}
                          >
                            {isSelected ? '✓' : ''}
                          </div>

                          <div className="space-y-1">
                            <h4 className="font-serif font-bold text-xs text-[#221E18]">
                              {opt.label}
                            </h4>
                            <p className="text-[11px] text-[#7A705F] leading-relaxed">
                              {opt.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 4: Typography & Text Content */}
              {activeTab === 'typography' && (
                <div className="space-y-3.5 text-xs">
                  <span className="font-semibold text-[#221E18]">
                    Cover Typography &amp; Colophon Imprint
                  </span>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-[#7A705F]">
                      Book Title
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Title of manuscript"
                      className="w-full px-3 py-2 bg-white border border-[#E5DEC9] rounded font-serif text-sm text-[#221E18] focus:outline-none focus:border-[#B54B32]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-[#7A705F]">
                      Subtitle / Genre Tagline
                    </label>
                    <input
                      type="text"
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                      placeholder="e.g. A Gothic Mystery"
                      className="w-full px-3 py-2 bg-white border border-[#E5DEC9] rounded text-xs text-[#221E18] focus:outline-none focus:border-[#B54B32]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-[#7A705F]">
                      Author Name
                    </label>
                    <input
                      type="text"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      placeholder="Author's name as displayed on cover"
                      className="w-full px-3 py-2 bg-white border border-[#E5DEC9] rounded font-serif italic text-xs text-[#221E18] focus:outline-none focus:border-[#B54B32]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-[#7A705F]">
                      Publisher Colophon / Imprint
                    </label>
                    <input
                      type="text"
                      value={imprint}
                      onChange={(e) => setImprint(e.target.value)}
                      placeholder="e.g. THREADLINE EDITIONS"
                      className="w-full px-3 py-2 bg-white border border-[#E5DEC9] rounded font-mono text-[11px] text-[#221E18] focus:outline-none focus:border-[#B54B32]"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-3.5 border-t border-[#E5DEC9] bg-[#F1EAD9] flex items-center justify-between">
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-1.5 text-xs text-[#7A705F] hover:text-[#221E18] hover:bg-[#E5DEC9] rounded transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw size={13} />
              Reset to Default
            </button>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs text-[#7A705F] hover:text-[#221E18] hover:bg-[#E5DEC9] rounded transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2 text-xs font-medium text-white bg-[#B54B32] hover:bg-[#9E3E27] rounded shadow-warm-sm transition-colors flex items-center gap-1.5 cursor-pointer font-serif"
              >
                <Check size={14} />
                Save Cover to Manuscript
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
