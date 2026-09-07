import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

interface MarkdownPreviewProps {
  title: string;
  content: string;
  fontSize: 'normal' | 'large' | 'compact';
  fontFamily: 'serif' | 'sans' | 'mono';
  sceneOrder?: number;
  wordCount?: number;
  isFullPreview?: boolean;
}

export const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({
  title,
  content,
  fontSize,
  fontFamily,
  sceneOrder,
  wordCount,
  isFullPreview = false
}) => {
  // Pre-process custom highlights: ==text== or ==color:text== to styled <mark> tags
  const processedMarkdown = useMemo(() => {
    if (!content) return '';

    let text = content;

    // Color-coded highlights
    text = text.replace(/==yellow:(.*?)==/gi, '<mark class="hl-yellow">$1</mark>');
    text = text.replace(/==amber:(.*?)==/gi, '<mark class="hl-yellow">$1</mark>');
    text = text.replace(/==mint:(.*?)==/gi, '<mark class="hl-mint">$1</mark>');
    text = text.replace(/==green:(.*?)==/gi, '<mark class="hl-mint">$1</mark>');
    text = text.replace(/==rose:(.*?)==/gi, '<mark class="hl-rose">$1</mark>');
    text = text.replace(/==blue:(.*?)==/gi, '<mark class="hl-blue">$1</mark>');
    text = text.replace(/==purple:(.*?)==/gi, '<mark class="hl-purple">$1</mark>');

    // Standard highlight: ==text==
    text = text.replace(/==(.*?)==/g, '<mark class="hl-yellow">$1</mark>');

    return text;
  }, [content]);

  // Typography font class
  const fontClass =
    fontFamily === 'sans'
      ? 'font-sans'
      : fontFamily === 'mono'
      ? 'font-mono'
      : 'font-serif';

  // Typography size class
  const sizeClass =
    fontSize === 'large'
      ? 'text-xl leading-[1.95]'
      : fontSize === 'compact'
      ? 'text-base leading-[1.75]'
      : 'text-lg leading-[1.85]';

  return (
    <div
      className={`h-full min-h-0 overflow-y-auto overscroll-contain scrollbar-subtle selection:bg-[#EAE4D6] px-6 md:px-12 py-8 ${
        isFullPreview ? 'max-w-2xl mx-auto w-full' : 'w-full'
      }`}
    >
      {/* Header Info */}
      <div className="pt-8 sm:pt-12 mb-8 pb-6 border-b border-[#EBE8E2]/80 text-center">
        <div className="flex items-center justify-center gap-3 text-[11px] font-mono text-[#8C887F] uppercase tracking-wider mb-3 select-none">
          <span>{sceneOrder ? `Scene ${sceneOrder}` : 'Draft'}</span>
          <span className="opacity-30">·</span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Live Preview {wordCount !== undefined ? `· ${wordCount} words` : ''}
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-serif font-semibold text-[#1A1814] tracking-tight text-center">
          {title || 'Untitled Scene'}
        </h1>
      </div>

      {/* Rendered Prose */}
      {processedMarkdown.trim() ? (
        <div
          className={`${fontClass} ${sizeClass} text-[#33312D] prose-manuscript space-y-4`}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={{
              h1: ({ children }) => (
                <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#1A1814] mt-8 mb-3 tracking-tight">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-xl md:text-2xl font-serif font-semibold text-[#1A1814] mt-7 mb-2.5 tracking-tight">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-lg md:text-xl font-serif font-medium text-[#2D2A26] mt-6 mb-2">
                  {children}
                </h3>
              ),
              p: ({ children }) => (
                <p className="mb-4 text-[#33312D] text-justify md:text-left leading-relaxed">
                  {children}
                </p>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-2 border-[#D4A373] pl-4 py-1.5 my-5 italic text-[#4A463F] bg-[#FAF9F5]/70 rounded-r-md">
                  {children}
                </blockquote>
              ),
              hr: () => (
                <div className="my-8 flex items-center justify-center text-[#8C887F] text-base tracking-[0.6em] font-serif select-none">
                  * * *
                </div>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-inside space-y-1 my-3 pl-2 text-[#3C3933]">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-inside space-y-1 my-3 pl-2 text-[#3C3933]">
                  {children}
                </ol>
              ),
              del: ({ children }) => (
                <del className="line-through text-[#8C887F] decoration-[#AAA69F]">
                  {children}
                </del>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold text-[#1A1814]">{children}</strong>
              ),
              em: ({ children }) => (
                <em className="italic text-[#2D2A26]">{children}</em>
              ),
              mark: ({ children, className }) => {
                let bgClass = 'bg-amber-100/90 border-amber-300 text-amber-950';
                if (className?.includes('hl-mint')) {
                  bgClass = 'bg-emerald-100/90 border-emerald-300 text-emerald-950';
                } else if (className?.includes('hl-rose')) {
                  bgClass = 'bg-rose-100/90 border-rose-300 text-rose-950';
                } else if (className?.includes('hl-blue')) {
                  bgClass = 'bg-sky-100/90 border-sky-300 text-sky-950';
                } else if (className?.includes('hl-purple')) {
                  bgClass = 'bg-purple-100/90 border-purple-300 text-purple-950';
                }
                return (
                  <mark
                    className={`${bgClass} px-1.5 py-0.5 rounded-sm border-b font-normal shadow-2xs inline-block transition-colors`}
                  >
                    {children}
                  </mark>
                );
              }
            }}
          >
            {processedMarkdown}
          </ReactMarkdown>
        </div>
      ) : (
        <div className="py-20 text-center text-[#AAA69F] select-none">
          <p className="font-serif italic text-lg mb-2">No prose drafted yet.</p>
          <p className="text-xs font-mono">
            Type in the manuscript editor to see real-time markdown typesetting.
          </p>
        </div>
      )}
    </div>
  );
};
