import React, { useState, useRef, useEffect } from 'react';
import { Scene, ScreenplayElementType } from '../../types';
import { Film, Clapperboard, Sparkles, HelpCircle, Columns2 } from 'lucide-react';

interface ScreenplayCanvasProps {
  scene: Scene;
  onUpdateScene: (updatedFields: Partial<Scene>) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
}

export const ScreenplayCanvas: React.FC<ScreenplayCanvasProps> = ({
  scene,
  onUpdateScene,
  textareaRef
}) => {
  const [currentElement, setCurrentElement] = useState<ScreenplayElementType>('action');
  const [cursorLine, setCursorLine] = useState(0);
  const [splitPreview, setSplitPreview] = useState(false);

  // Detect which screenplay element current cursor line belongs to
  const detectLineElement = (lineText: string): ScreenplayElementType => {
    const trimmed = lineText.trim();
    if (!trimmed) return 'action';

    if (/^(INT\.|EXT\.|INT\/EXT\.|I\/E\.)/i.test(trimmed)) {
      return 'scene_heading';
    }
    if (/^(FADE IN:|FADE OUT\.|CUT TO:|DISSOLVE TO:|SMASH CUT TO:)/i.test(trimmed) || lineText.startsWith('\t\t\t\t\t\t')) {
      return 'transition';
    }
    if (/^\(.*\)$/.test(trimmed) || lineText.startsWith('\t\t\t')) {
      return 'parenthetical';
    }
    if (lineText.startsWith('\t\t\t\t') || (trimmed === trimmed.toUpperCase() && trimmed.length < 35 && !trimmed.endsWith('.'))) {
      return 'character';
    }
    if (lineText.startsWith('\t\t')) {
      return 'dialogue';
    }
    return 'action';
  };

  const updateCursorContext = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const pos = textarea.selectionStart;
    const textBefore = textarea.value.slice(0, pos);
    const lines = textBefore.split('\n');
    const lineIdx = lines.length - 1;
    setCursorLine(lineIdx);

    const fullLines = textarea.value.split('\n');
    const currentLineText = fullLines[lineIdx] || '';
    setCurrentElement(detectLineElement(currentLineText));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // TAB KEY: Cycle screenplay element for current line
    if (e.key === 'Tab') {
      e.preventDefault();
      const pos = textarea.selectionStart;
      const text = textarea.value;
      const lines = text.split('\n');
      const textBefore = text.slice(0, pos);
      const lineIdx = textBefore.split('\n').length - 1;
      const lineText = lines[lineIdx] || '';

      const cycleOrder: ScreenplayElementType[] = [
        'scene_heading',
        'action',
        'character',
        'parenthetical',
        'dialogue',
        'transition'
      ];

      const currentType = detectLineElement(lineText);
      const nextIdx = (cycleOrder.indexOf(currentType) + 1) % cycleOrder.length;
      const nextType = cycleOrder[nextIdx];

      applyElementTypeToLine(lineIdx, nextType);
      return;
    }

    // ENTER KEY: Intelligent advance
    if (e.key === 'Enter') {
      const pos = textarea.selectionStart;
      const text = textarea.value;
      const textBefore = text.slice(0, pos);
      const lines = textBefore.split('\n');
      const currentLineText = lines[lines.length - 1] || '';
      const currentType = detectLineElement(currentLineText);

      // Auto-capitalize Scene Headings & Characters
      if (currentType === 'scene_heading' || currentType === 'character') {
        // handled on change
      }

      // If pressing Enter on Character -> next line should automatically be Dialogue (\t\t)
      if (currentType === 'character') {
        e.preventDefault();
        const before = text.slice(0, pos);
        const after = text.slice(pos);
        const insert = '\n\t\t';
        const newText = before + insert + after;
        const words = newText.trim() ? newText.trim().split(/\s+/).length : 0;
        onUpdateScene({ proseContent: newText, wordCount: words });
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = pos + insert.length;
          updateCursorContext();
        }, 0);
        return;
      }

      // If pressing Enter on Parenthetical -> next line should be Dialogue (\t\t)
      if (currentType === 'parenthetical') {
        e.preventDefault();
        const before = text.slice(0, pos);
        const after = text.slice(pos);
        const insert = '\n\t\t';
        const newText = before + insert + after;
        const words = newText.trim() ? newText.trim().split(/\s+/).length : 0;
        onUpdateScene({ proseContent: newText, wordCount: words });
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = pos + insert.length;
          updateCursorContext();
        }, 0);
        return;
      }

      // If pressing Enter on Dialogue -> blank line for Action
      if (currentType === 'dialogue') {
        e.preventDefault();
        const before = text.slice(0, pos);
        const after = text.slice(pos);
        const insert = '\n\n';
        const newText = before + insert + after;
        const words = newText.trim() ? newText.trim().split(/\s+/).length : 0;
        onUpdateScene({ proseContent: newText, wordCount: words });
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = pos + insert.length;
          updateCursorContext();
        }, 0);
        return;
      }
    }
  };

  const applyElementTypeToLine = (lineIdx: number, type: ScreenplayElementType) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const lines = textarea.value.split('\n');
    let line = lines[lineIdx] || '';
    // Strip tabs and leading spaces
    let clean = line.replace(/^[\t\s]+/, '');

    switch (type) {
      case 'scene_heading':
        if (!/^(INT\.|EXT\.)/i.test(clean)) {
          clean = 'INT. ' + clean.toUpperCase();
        } else {
          clean = clean.toUpperCase();
        }
        break;
      case 'character':
        clean = '\t\t\t\t' + clean.toUpperCase();
        break;
      case 'parenthetical':
        clean = clean.replace(/^\(?([^)]*)\)?$/, '($1)');
        clean = '\t\t\t' + clean;
        break;
      case 'dialogue':
        clean = '\t\t' + clean;
        break;
      case 'transition':
        clean = '\t\t\t\t\t\t' + clean.toUpperCase();
        if (!clean.endsWith(':')) clean += ':';
        break;
      case 'action':
      default:
        // regular action
        break;
    }

    lines[lineIdx] = clean;
    const newText = lines.join('\n');
    const words = newText.trim() ? newText.trim().split(/\s+/).length : 0;
    onUpdateScene({ proseContent: newText, wordCount: words });
    setCurrentElement(type);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#2D2A26] text-[#FAF6EE] select-text">
      {/* Screenplay Top Sub-Bar */}
      <div className="px-6 py-2 bg-[#201D1A] border-b border-black/40 flex items-center justify-between text-xs select-none shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-[4px] bg-[#DE6346] text-white flex items-center justify-center shadow-xs">
            <Clapperboard size={12} />
          </div>
          <span className="font-mono font-bold uppercase tracking-wider text-white">
            Screenplay Auto-Format Mode
          </span>
          <span className="text-[#A39B8F] text-[11px]">
            (Industry standard Courier 12pt, dynamic tab/enter states)
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setSplitPreview(!splitPreview)}
            className={`px-2.5 py-1 rounded text-xs flex items-center gap-1 cursor-pointer transition-colors ${
              splitPreview ? 'bg-[#DE6346] text-white' : 'bg-[#3A3632] text-[#A39B8F] hover:text-white'
            }`}
          >
            <Columns2 size={12} />
            <span>{splitPreview ? 'Close Script Preview' : 'Side-by-Side Typeset'}</span>
          </button>
        </div>
      </div>

      {/* Main Screenplay Canvas */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Interactive Screenplay Editor */}
        <div className="flex-1 flex flex-col overflow-y-auto p-4 sm:p-8 items-center bg-[#24211E]">
          {/* Simulated 8.5x11 Paper Script Page */}
          <div className="w-full max-w-[720px] min-h-[900px] bg-[#FAF8F5] text-[#1A1815] shadow-2xl rounded-[4px] p-12 sm:p-16 font-mono text-[13px] leading-[1.65] relative flex flex-col">
            <div className="text-right text-[10px] text-stone-400 font-mono mb-4 select-none">
              SCENE {scene.order || 1} • {scene.title.toUpperCase()}
            </div>

            <textarea
              ref={textareaRef}
              value={scene.proseContent}
              onChange={(e) => {
                const val = e.target.value;
                const words = val.trim() ? val.trim().split(/\s+/).length : 0;
                onUpdateScene({ proseContent: val, wordCount: words });
                updateCursorContext();
              }}
              onKeyDown={handleKeyDown}
              onKeyUp={updateCursorContext}
              onClick={updateCursorContext}
              placeholder="INT. CLOCKTOWER WORKSHOP - DAWN&#10;&#10;The cold has set deep into the granite flags...&#10;&#10;SILAS&#10;The shop is closed till tierce."
              className="flex-1 w-full resize-none border-none outline-none bg-transparent font-mono text-[13px] leading-[1.65] text-[#1A1815] placeholder-stone-400"
            />
          </div>
        </div>

        {/* Right: Real-Time Hollywood Typeset View (If toggled) */}
        {splitPreview && (
          <div className="w-1/2 border-l border-black/40 bg-[#1A1815] p-8 overflow-y-auto flex justify-center">
            <div className="w-full max-w-[620px] bg-[#FAF8F5] text-[#1A1815] shadow-2xl p-12 font-mono text-[12px] leading-[1.6] space-y-4">
              <div className="text-right text-[10px] text-stone-400 select-none pb-2 border-b border-stone-200">
                PAGE 1
              </div>
              {scene.proseContent.split('\n').map((line, i) => {
                const type = detectLineElement(line);
                const trimmed = line.trim();
                if (!trimmed) return <div key={i} className="h-4" />;

                if (type === 'scene_heading') {
                  return (
                    <div key={i} className="font-bold uppercase tracking-wider text-black pt-2">
                      {trimmed}
                    </div>
                  );
                }
                if (type === 'character') {
                  return (
                    <div key={i} className="uppercase font-bold text-center pl-12 text-black pt-1">
                      {trimmed}
                    </div>
                  );
                }
                if (type === 'parenthetical') {
                  return (
                    <div key={i} className="italic text-center pl-6 text-stone-700">
                      {trimmed}
                    </div>
                  );
                }
                if (type === 'dialogue') {
                  return (
                    <div key={i} className="max-w-[70%] mx-auto text-black">
                      {trimmed}
                    </div>
                  );
                }
                if (type === 'transition') {
                  return (
                    <div key={i} className="text-right font-bold uppercase text-black pt-2">
                      {trimmed}
                    </div>
                  );
                }
                return (
                  <div key={i} className="text-stone-900">
                    {trimmed}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* DOCKED SCREENPLAY ELEMENT SWITCHER BAR */}
      <div className="px-6 py-2.5 bg-[#1F1C19] border-t border-black/50 flex flex-wrap items-center justify-between gap-3 text-xs select-none shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono uppercase text-[#A39B8F] mr-2">
            Active Element:
          </span>

          {[
            { id: 'scene_heading' as ScreenplayElementType, label: 'Scene Heading', key: 'Tab 1' },
            { id: 'action' as ScreenplayElementType, label: 'Action', key: 'Tab 2' },
            { id: 'character' as ScreenplayElementType, label: 'Character', key: 'Tab 3' },
            { id: 'parenthetical' as ScreenplayElementType, label: 'Parenthetical', key: 'Tab 4' },
            { id: 'dialogue' as ScreenplayElementType, label: 'Dialogue', key: 'Tab 5' },
            { id: 'transition' as ScreenplayElementType, label: 'Transition', key: 'Tab 6' }
          ].map((item) => {
            const isCurrent = currentElement === item.id;
            return (
              <button
                key={item.id}
                onClick={() => applyElementTypeToLine(cursorLine, item.id)}
                className={`px-2.5 py-1 rounded-[4px] text-[11px] font-mono cursor-pointer transition-all flex items-center gap-1.5 ${
                  isCurrent
                    ? 'bg-[#DE6346] text-white font-bold shadow-xs scale-105'
                    : 'bg-[#2E2A26] text-[#A39B8F] hover:text-white hover:bg-[#3E3A36]'
                }`}
              >
                <span>{item.label}</span>
                <span className="text-[9px] opacity-60">({item.key})</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3 text-[11px] font-mono text-[#A39B8F]">
          <span>Press <strong>Tab</strong> to cycle element</span>
          <span>•</span>
          <span>Press <strong>Enter</strong> to auto-advance</span>
        </div>
      </div>
    </div>
  );
};
