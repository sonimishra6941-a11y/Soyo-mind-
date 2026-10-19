import React, { useState } from 'react';
import { Copy, Check, Terminal, FileCode, WrapText, CheckCheck } from 'lucide-react';
import { triggerVisualFx } from '../utils/visualFx';

interface CodeBlockProps {
  code: string;
  language?: string;
  id?: string;
  isStreaming?: boolean;
}

// Pretty language labels and color badges
const LANGUAGE_INFO: Record<string, { label: string; color: string; isShell?: boolean }> = {
  javascript: { label: 'JavaScript', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  js: { label: 'JavaScript', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  typescript: { label: 'TypeScript', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
  ts: { label: 'TypeScript', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
  tsx: { label: 'React TSX', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
  jsx: { label: 'React JSX', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
  python: { label: 'Python', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
  py: { label: 'Python', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
  bash: { label: 'Bash', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', isShell: true },
  sh: { label: 'Shell', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', isShell: true },
  zsh: { label: 'Zsh', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', isShell: true },
  shell: { label: 'Shell', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', isShell: true },
  terminal: { label: 'Terminal', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', isShell: true },
  html: { label: 'HTML', color: 'text-orange-400 bg-orange-500/10 border-orange-500/30' },
  css: { label: 'CSS', color: 'text-pink-400 bg-pink-500/10 border-pink-500/30' },
  scss: { label: 'SCSS', color: 'text-pink-400 bg-pink-500/10 border-pink-500/30' },
  json: { label: 'JSON', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30' },
  sql: { label: 'SQL', color: 'text-sky-400 bg-sky-500/10 border-sky-500/30' },
  c: { label: 'C', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30' },
  cpp: { label: 'C++', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30' },
  'c++': { label: 'C++', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30' },
  csharp: { label: 'C#', color: 'text-violet-400 bg-violet-500/10 border-violet-500/30' },
  'c#': { label: 'C#', color: 'text-violet-400 bg-violet-500/10 border-violet-500/30' },
  cs: { label: 'C#', color: 'text-violet-400 bg-violet-500/10 border-violet-500/30' },
  rust: { label: 'Rust', color: 'text-amber-500 bg-amber-500/10 border-amber-500/30' },
  go: { label: 'Go', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
  golang: { label: 'Go', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
  java: { label: 'Java', color: 'text-red-400 bg-red-500/10 border-red-500/30' },
  kotlin: { label: 'Kotlin', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
  swift: { label: 'Swift', color: 'text-orange-500 bg-orange-500/10 border-orange-500/30' },
  ruby: { label: 'Ruby', color: 'text-red-500 bg-red-500/10 border-red-500/30' },
  php: { label: 'PHP', color: 'text-indigo-300 bg-indigo-500/10 border-indigo-500/30' },
  yaml: { label: 'YAML', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' },
  yml: { label: 'YAML', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' },
  markdown: { label: 'Markdown', color: 'text-slate-300 bg-slate-500/10 border-slate-500/30' },
  md: { label: 'Markdown', color: 'text-slate-300 bg-slate-500/10 border-slate-500/30' },
  dockerfile: { label: 'Docker', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
};

// Syntax high-contrast token coloring helper
function highlightCodeLine(line: string, lang: string): React.ReactNode {
  if (!line) return '\u00A0';

  // Comments
  if (line.trim().startsWith('//') || line.trim().startsWith('#') || line.trim().startsWith('/*') || line.trim().startsWith('*')) {
    return <span className="text-slate-400/90 italic font-mono">{line}</span>;
  }

  // Tokenization regex for comments, strings, keywords, numbers, operators
  const tokens = line.split(
    /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`|\b(?:const|let|var|function|def|fn|return|if|else|for|while|import|export|from|class|interface|type|extends|implements|as|new|async|await|try|catch|finally|throw|typeof|instanceof|switch|case|default|public|private|protected|static|readonly|SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|JOIN|GROUP\s+BY|ORDER\s+BY)\b|\b(?:true|false|null|undefined|nil|None)\b|\b\d+(?:\.\d+)?\b)/g
  );

  return tokens.map((part, idx) => {
    if (!part) return null;

    // Strings
    if (
      (part.startsWith('"') && part.endsWith('"')) ||
      (part.startsWith("'") && part.endsWith("'")) ||
      (part.startsWith('`') && part.endsWith('`'))
    ) {
      return (
        <span key={idx} className="text-emerald-300 font-mono">
          {part}
        </span>
      );
    }

    // Keywords
    if (
      /^(?:const|let|var|function|def|fn|return|if|else|for|while|import|export|from|class|interface|type|extends|implements|as|new|async|await|try|catch|finally|throw|typeof|instanceof|switch|case|default|public|private|protected|static|readonly|SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|JOIN|GROUP\s+BY|ORDER\s+BY)$/.test(
        part
      )
    ) {
      return (
        <span key={idx} className="text-purple-400 font-semibold font-mono">
          {part}
        </span>
      );
    }

    // Booleans / null
    if (/^(?:true|false|null|undefined|nil|None)$/.test(part)) {
      return (
        <span key={idx} className="text-amber-400 font-medium font-mono">
          {part}
        </span>
      );
    }

    // Numbers
    if (/^\d+(?:\.\d+)?$/.test(part)) {
      return (
        <span key={idx} className="text-cyan-300 font-mono">
          {part}
        </span>
      );
    }

    return (
      <span key={idx} className="text-slate-200 font-mono">
        {part}
      </span>
    );
  });
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language = 'code',
  id,
  isStreaming = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [wrapLines, setWrapLines] = useState(false);

  const cleanLang = (language || '').toLowerCase().trim();
  const langConfig = LANGUAGE_INFO[cleanLang] || {
    label: cleanLang ? cleanLang.charAt(0).toUpperCase() + cleanLang.slice(1) : 'Code',
    color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
    isShell: ['bash', 'sh', 'zsh', 'shell', 'terminal'].includes(cleanLang),
  };

  const lines = code.split('\n');
  const lineCount = lines.length;

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerVisualFx(e.clientX, e.clientY, '#10b981');

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(code);
      } else {
        // Fallback for non-secure contexts
        const textArea = document.createElement('textarea');
        textArea.value = code;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  return (
    <div
      id={id}
      className="my-3.5 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800/90 shadow-xl group transition-all text-xs sm:text-sm font-mono relative"
    >
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-900/95 border-b border-slate-800/80 text-slate-300 select-none">
        {/* Left: Window Dots & Language Badge */}
        <div className="flex items-center gap-3">
          {/* macOS window controls style */}
          <div className="hidden sm:flex items-center gap-1.5 opacity-70 group-hover:opacity-100 transition-opacity">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>

          {/* Language Badge */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-md border text-[11px] font-semibold tracking-wide uppercase ${langConfig.color}`}
          >
            {langConfig.isShell ? (
              <Terminal className="w-3 h-3" />
            ) : (
              <FileCode className="w-3 h-3" />
            )}
            <span>{langConfig.label}</span>
          </div>

          {/* Line count & Streaming indicator */}
          <span className="text-[11px] text-slate-500 font-sans hidden sm:inline-block">
            {lineCount} {lineCount === 1 ? 'line' : 'lines'}
          </span>

          {isStreaming && (
            <span className="flex items-center gap-1.5 text-[11px] text-indigo-400 font-sans animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
              Streaming code...
            </span>
          )}
        </div>

        {/* Right: Actions (Wrap toggle & Copy Button) */}
        <div className="flex items-center gap-2">
          {/* Line Wrap Toggle */}
          <button
            type="button"
            onClick={() => setWrapLines(!wrapLines)}
            title={wrapLines ? 'Switch to horizontal scroll' : 'Wrap long lines'}
            className={`clickable-option p-1.5 rounded-lg border text-xs transition-colors ${
              wrapLines
                ? 'bg-indigo-950/60 border-indigo-700/60 text-indigo-300'
                : 'bg-slate-800/60 border-slate-700/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <WrapText className="w-3.5 h-3.5" />
          </button>

          {/* Prominent Copy Code Button */}
          <button
            type="button"
            onClick={handleCopy}
            aria-label="Copy code to clipboard"
            className={`clickable-option flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold font-sans transition-all duration-200 active:scale-95 shadow-xs ${
              copied
                ? 'bg-emerald-600 text-white shadow-emerald-600/30 ring-2 ring-emerald-400/40'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20 hover:shadow-indigo-600/30'
            }`}
          >
            {copied ? (
              <>
                <CheckCheck className="w-3.5 h-3.5 text-white animate-in zoom-in-75 duration-150" />
                <span className="font-bold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Viewer Body */}
      <div className="relative overflow-x-auto scrollbar-thin">
        <pre
          className={`p-4 text-xs sm:text-sm font-mono leading-relaxed text-slate-200 ${
            wrapLines ? 'whitespace-pre-wrap break-words' : 'whitespace-pre'
          }`}
        >
          <code>
            {lines.map((line, idx) => (
              <div key={idx} className="table-row group/line hover:bg-slate-900/40">
                <span className="table-cell select-none pr-4 text-right text-slate-600 group-hover/line:text-slate-400 text-[11px] sm:text-xs min-w-[2.2rem] font-sans">
                  {idx + 1}
                </span>
                <span className="table-cell pl-1">
                  {highlightCodeLine(line, cleanLang)}
                </span>
              </div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
};
