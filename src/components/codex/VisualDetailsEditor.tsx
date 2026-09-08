import React, { useState, useRef, useEffect } from 'react';
import { VisualDetails } from '../../types';
import { CHARACTER_AVATAR_PRESETS, WORLD_PRESET_IMAGES, VisualPreset } from '../../data/codexVisualPresets';
import { compressImageFile, compressDataUrl } from '../../utils/imageUtils';
import {
  Image as ImageIcon,
  Upload,
  Link,
  Palette,
  Sparkles,
  X,
  Plus,
  Trash2,
  Eye,
  Check,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface VisualDetailsEditorProps {
  entityType: 'character' | 'world' | 'artifact';
  visualDetails?: VisualDetails;
  onChange: (updated: VisualDetails) => void;
}

export const VisualDetailsEditor: React.FC<VisualDetailsEditorProps> = ({
  entityType,
  visualDetails = {},
  onChange
}) => {
  const [urlInput, setUrlInput] = useState(visualDetails.imageUrl || '');
  const [newColorInput, setNewColorInput] = useState('#B54B32');
  const [newMoodTag, setNewMoodTag] = useState('');
  const [showPresetPicker, setShowPresetPicker] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [imageLoadError, setImageLoadError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync urlInput when entity or imageUrl changes
  useEffect(() => {
    setUrlInput(visualDetails.imageUrl || '');
    setImageLoadError(false);
  }, [visualDetails.imageUrl]);

  // Handle local file upload with canvas compression to prevent localStorage overflow
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input value so selecting the same file triggers change
    e.target.value = '';

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }

    setIsProcessing(true);
    setUploadError(null);
    setImageLoadError(false);

    try {
      // Compress to max 512x512 JPEG at 0.85 quality (~25KB-40KB)
      const compressedDataUrl = await compressImageFile(file, 512, 0.85);
      setUrlInput(compressedDataUrl);
      onChange({
        ...visualDetails,
        imageUrl: compressedDataUrl
      });
    } catch (err: any) {
      console.error('Failed to process image:', err);
      setUploadError('Could not process this image. Try another file or format.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = urlInput.trim();
    setUploadError(null);
    setImageLoadError(false);

    if (!trimmed) {
      onChange({
        ...visualDetails,
        imageUrl: undefined
      });
      return;
    }

    // If a massive data URL was pasted, downscale it
    if (trimmed.startsWith('data:image/') && trimmed.length > 80000) {
      try {
        setIsProcessing(true);
        const compressed = await compressDataUrl(trimmed, 512, 0.85);
        onChange({
          ...visualDetails,
          imageUrl: compressed
        });
        setUrlInput(compressed);
        return;
      } catch {
        // Fallback to applying trimmed
      } finally {
        setIsProcessing(false);
      }
    }

    onChange({
      ...visualDetails,
      imageUrl: trimmed
    });
  };

  const handleSelectPreset = (preset: VisualPreset) => {
    setUrlInput(preset.url);
    setImageLoadError(false);
    setUploadError(null);
    onChange({
      ...visualDetails,
      imageUrl: preset.url,
      colorPalette: preset.colorPalette,
      moodKeywords: preset.moodKeywords,
      attireOrArchitecture: preset.attireOrArchitecture
    });
    setShowPresetPicker(false);
  };

  const handleAddColor = () => {
    if (!newColorInput) return;
    const current = visualDetails.colorPalette || [];
    if (!current.includes(newColorInput)) {
      onChange({
        ...visualDetails,
        colorPalette: [...current, newColorInput]
      });
    }
  };

  const handleRemoveColor = (col: string) => {
    const current = visualDetails.colorPalette || [];
    onChange({
      ...visualDetails,
      colorPalette: current.filter((c) => c !== col)
    });
  };

  const handleAddMoodTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newMoodTag.trim()) {
      e.preventDefault();
      const current = visualDetails.moodKeywords || [];
      if (!current.includes(newMoodTag.trim())) {
        onChange({
          ...visualDetails,
          moodKeywords: [...current, newMoodTag.trim()]
        });
      }
      setNewMoodTag('');
    }
  };

  const handleRemoveMoodTag = (tag: string) => {
    const current = visualDetails.moodKeywords || [];
    onChange({
      ...visualDetails,
      moodKeywords: current.filter((t) => t !== tag)
    });
  };

  const presets = entityType === 'character' ? CHARACTER_AVATAR_PRESETS : WORLD_PRESET_IMAGES;

  return (
    <div className="space-y-4 bg-[#F1EAD9] p-3.5 sm:p-4 rounded-[8px] border border-[rgba(34,30,24,0.1)] text-xs select-none">
      <div className="flex items-center justify-between border-b border-[rgba(34,30,24,0.08)] pb-2">
        <div className="flex items-center gap-2">
          <ImageIcon size={15} className="text-[#B54B32]" />
          <h4 className="font-serif font-bold text-xs sm:text-sm text-[#221E18]">
            {entityType === 'character' ? 'Character Visual Dossier' : 'World Atmosphere & Visuals'}
          </h4>
        </div>

        <button
          type="button"
          onClick={() => setShowPresetPicker(!showPresetPicker)}
          className="flex items-center gap-1 text-[11px] font-semibold text-[#B54B32] hover:text-[#9E3E27] cursor-pointer"
        >
          <Sparkles size={12} />
          <span>{showPresetPicker ? 'Hide Presets' : 'Curated Presets'}</span>
        </button>
      </div>

      {/* Preset Picker Dropdown */}
      {showPresetPicker && (
        <div className="p-3 bg-[#FAF6EE] rounded-[6px] border border-[rgba(34,30,24,0.12)] space-y-2.5 shadow-2xs">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#7A705F] font-semibold block">
            Click to Apply Curated Aesthetic &amp; Image:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {presets.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectPreset(p)}
                className="group p-2 rounded-[5px] border border-[rgba(34,30,24,0.1)] hover:border-[#B54B32] bg-white text-left transition-all cursor-pointer flex flex-col items-center text-center"
              >
                <img
                  src={p.url}
                  alt={p.name}
                  className="w-14 h-14 object-cover rounded-[4px] mb-1.5 border border-[rgba(34,30,24,0.1)]"
                  referrerPolicy="no-referrer"
                />
                <span className="text-[11px] font-semibold text-[#221E18] group-hover:text-[#B54B32] line-clamp-1">
                  {p.name}
                </span>
                <div className="flex gap-1 mt-1">
                  {p.colorPalette.slice(0, 3).map((c, i) => (
                    <span key={i} className="w-2 h-2 rounded-full" style={{ backgroundColor: c }} />
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Image Preview & Controls */}
      <div className="flex flex-col sm:flex-row items-start gap-4">
        {/* Visual Preview Box */}
        <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-[8px] border-2 border-dashed border-[rgba(34,30,24,0.2)] bg-white overflow-hidden shrink-0 flex items-center justify-center relative group">
          {isProcessing ? (
            <div className="text-center p-2 text-[#7A705F] space-y-1">
              <Loader2 size={22} className="animate-spin mx-auto text-[#B54B32]" />
              <span className="text-[10px] block font-mono">Optimizing...</span>
            </div>
          ) : visualDetails.imageUrl ? (
            <>
              {!imageLoadError ? (
                <img
                  src={visualDetails.imageUrl}
                  alt="Entity Visual"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={() => setImageLoadError(true)}
                />
              ) : (
                <div className="text-center p-2 text-red-700 bg-red-50/70 w-full h-full flex flex-col items-center justify-center space-y-1">
                  <AlertCircle size={20} className="text-red-600" />
                  <span className="text-[10px] block font-medium leading-tight">Image load failed</span>
                </div>
              )}
              <button
                type="button"
                onClick={() => {
                  setUrlInput('');
                  setImageLoadError(false);
                  onChange({ ...visualDetails, imageUrl: undefined });
                }}
                className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                title="Remove Image"
              >
                <X size={12} />
              </button>
            </>
          ) : (
            <div className="text-center p-2 text-[#7A705F]">
              <ImageIcon size={24} className="mx-auto mb-1 opacity-50" />
              <span className="text-[10px] block">No visual set</span>
            </div>
          )}
        </div>

        {/* Upload & Link Controls */}
        <div className="flex-1 space-y-2 w-full">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[5px] bg-[#FAF6EE] border border-[rgba(34,30,24,0.15)] text-[#221E18] text-xs font-semibold hover:bg-white transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
            >
              <Upload size={13} className="text-[#B54B32]" />
              <span>{isProcessing ? 'Processing Image...' : 'Upload Image File'}</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
            <span className="text-[10px] text-[#7A705F]">Auto-optimized for studio (JPG, PNG, WebP)</span>
          </div>

          {uploadError && (
            <div className="flex items-center gap-1.5 text-[11px] text-red-700 bg-red-50 p-1.5 rounded border border-red-200">
              <AlertCircle size={13} className="shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          <form onSubmit={handleApplyUrl} className="flex gap-1.5">
            <div className="relative flex-1">
              <Link size={12} className="absolute left-2.5 top-2.5 text-[#7A705F]" />
              <input
                type="text"
                placeholder="Or paste external image URL..."
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="w-full text-xs pl-7 pr-2 py-1.5 rounded-[5px] border border-[rgba(34,30,24,0.12)] bg-[#FAF6EE] focus:outline-none focus:border-[#B54B32]"
              />
            </div>
            <button
              type="submit"
              disabled={isProcessing}
              className="px-3 py-1.5 bg-[#FAF6EE] border border-[rgba(34,30,24,0.15)] text-[#221E18] text-xs font-semibold rounded-[5px] hover:bg-white cursor-pointer disabled:opacity-50"
            >
              Apply
            </button>
          </form>

          {/* Color Palette Swatches */}
          <div className="pt-2 border-t border-[rgba(34,30,24,0.06)] flex items-center flex-wrap gap-2">
            <div className="flex items-center gap-1 text-[#7A705F]">
              <Palette size={13} />
              <span className="text-[11px] font-mono">Palette:</span>
            </div>

            <div className="flex items-center gap-1.5">
              {(visualDetails.colorPalette || []).map((col, idx) => (
                <div key={idx} className="relative group">
                  <span
                    className="w-5 h-5 rounded-full inline-block border border-black/10 shadow-2xs cursor-pointer"
                    style={{ backgroundColor: col }}
                    title={col}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveColor(col)}
                    className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={8} />
                  </button>
                </div>
              ))}

              {/* Add color input */}
              <input
                type="color"
                value={newColorInput}
                onChange={(e) => setNewColorInput(e.target.value)}
                className="w-5 h-5 rounded-full border-0 p-0 cursor-pointer overflow-hidden bg-transparent"
                title="Pick color"
              />
              <button
                type="button"
                onClick={handleAddColor}
                className="p-1 rounded text-[#7A705F] hover:text-[#221E18] cursor-pointer"
                title="Add Swatch"
              >
                <Plus size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Physical / Aesthetic Notes */}
      <div className="space-y-2 pt-2 border-t border-[rgba(34,30,24,0.08)]">
        <div>
          <label className="text-[11px] font-mono text-[#7A705F] uppercase font-semibold block mb-1">
            {entityType === 'character' ? 'Appearance & Distinctive Marks' : 'Sensory Atmosphere (Smells, Sounds, Light)'}
          </label>
          <textarea
            value={
              entityType === 'character'
                ? visualDetails.appearanceNotes || ''
                : visualDetails.sensoryAtmosphere || ''
            }
            onChange={(e) =>
              onChange({
                ...visualDetails,
                ...(entityType === 'character'
                  ? { appearanceNotes: e.target.value }
                  : { sensoryAtmosphere: e.target.value })
              })
            }
            placeholder={
              entityType === 'character'
                ? 'Height, build, silvering temples, trembling left thumb, severe posture...'
                : 'Smell of wet coal smoke, sulfurous fog, rhythmic ticking of overhead crown wheel...'
            }
            rows={2}
            className="w-full text-xs p-2 rounded-[5px] border border-[rgba(34,30,24,0.12)] bg-[#FAF6EE] focus:outline-none focus:border-[#B54B32] resize-none"
          />
        </div>

        <div>
          <label className="text-[11px] font-mono text-[#7A705F] uppercase font-semibold block mb-1">
            {entityType === 'character' ? 'Attire & Costume Style' : 'Architecture & Materiality'}
          </label>
          <input
            type="text"
            value={visualDetails.attireOrArchitecture || ''}
            onChange={(e) =>
              onChange({
                ...visualDetails,
                attireOrArchitecture: e.target.value
              })
            }
            placeholder={
              entityType === 'character'
                ? 'Coarse grey Bohemian shawl, oilcloth spats, brass jeweler loupe...'
                : 'High-ribbed Gothic rafters, verdigris copper filing cases, granite flagged floors...'
            }
            className="w-full text-xs px-2.5 py-1.5 rounded-[5px] border border-[rgba(34,30,24,0.12)] bg-[#FAF6EE] focus:outline-none focus:border-[#B54B32]"
          />
        </div>

        {/* Mood Keywords Tags */}
        <div>
          <label className="text-[11px] font-mono text-[#7A705F] uppercase font-semibold block mb-1">
            Mood Keywords &amp; Aesthetic Tags (Press Enter)
          </label>
          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
            {(visualDetails.moodKeywords || []).map((tag, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#FAF6EE] border border-[rgba(34,30,24,0.1)] text-[#221E18]"
              >
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveMoodTag(tag)}
                  className="text-[#7A705F] hover:text-red-700"
                >
                  <X size={10} />
                </button>
              </span>
            ))}
            <input
              type="text"
              placeholder="+ Add tag..."
              value={newMoodTag}
              onChange={(e) => setNewMoodTag(e.target.value)}
              onKeyDown={handleAddMoodTag}
              className="text-xs px-2 py-0.5 rounded border border-[rgba(34,30,24,0.12)] bg-[#FAF6EE] w-24"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
