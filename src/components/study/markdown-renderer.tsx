"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Check, Copy, TerminalSquare } from "lucide-react";

/**
 * Recolors the editor theme into a notebook "ink on graph paper" palette:
 * blue keywords, green strings, purple functions, amber numbers —
 * like writing code with coloured pens on grid paper.
 */
const inkTheme = {
  ...oneLight,
  'code[class*="language-"]': {
    ...oneLight['code[class*="language-"]'],
    color: "oklch(0.3 0.025 262)",
    textShadow: "none",
  },
  'pre[class*="language-"]': {
    ...oneLight['pre[class*="language-"]'],
    background: "transparent",
  },
  comment: { color: "oklch(0.52 0.02 258)", fontStyle: "italic" },
  prolog: { color: "oklch(0.52 0.02 258)" },
  doctype: { color: "oklch(0.52 0.02 258)" },
  cdata: { color: "oklch(0.52 0.02 258)" },
  punctuation: { color: "oklch(0.42 0.02 262)" },
  property: { color: "oklch(0.52 0.12 305)" },
  tag: { color: "oklch(0.5 0.14 262)" },
  boolean: { color: "oklch(0.55 0.13 70)" },
  number: { color: "oklch(0.55 0.13 70)" },
  constant: { color: "oklch(0.55 0.13 70)" },
  symbol: { color: "oklch(0.55 0.13 70)" },
  deleted: { color: "oklch(0.52 0.02 258)" },
  selector: { color: "oklch(0.52 0.12 305)" },
  "attr-name": { color: "oklch(0.52 0.12 305)" },
  string: { color: "oklch(0.5 0.11 155)" },
  char: { color: "oklch(0.5 0.11 155)" },
  builtin: { color: "oklch(0.5 0.14 262)", fontWeight: "600" },
  inserted: { color: "oklch(0.5 0.11 155)" },
  operator: { color: "oklch(0.38 0.03 262)" },
  entity: { color: "oklch(0.38 0.03 262)", cursor: "help" },
  url: { color: "oklch(0.38 0.03 262)" },
  variable: { color: "oklch(0.35 0.03 262)" },
  atrule: { color: "oklch(0.52 0.12 305)" },
  "attr-value": { color: "oklch(0.5 0.11 155)" },
  keyword: { color: "oklch(0.5 0.14 262)", fontWeight: "600" },
  function: { color: "oklch(0.45 0.12 305)" },
  "class-name": { color: "oklch(0.45 0.12 305)" },
  regex: { color: "oklch(0.55 0.13 70)" },
  important: { color: "oklch(0.55 0.19 25)", fontWeight: "bold" },
};

/** Python code on a graph-paper sheet with a paper header strip. */
function CodeBlock({ language, value }: { language: string; value: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="relative my-5 overflow-hidden rounded-xl border border-ink/15 bg-grid-paper shadow-[0_2px_4px_oklch(0.3_0.03_262/0.08),0_12px_24px_-14px_oklch(0.3_0.03_262/0.25)]">
      {/* paper header strip */}
      <div className="flex items-center justify-between gap-2 border-b border-ink/10 bg-paper-cream/90 px-3 py-1.5">
        <span className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-wider text-pencil">
          <TerminalSquare className="h-3.5 w-3.5" aria-hidden />
          {language || "python"}
        </span>
        <button
          onClick={copy}
          aria-label="Copy code"
          className="btn3d btn-paper inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-mono text-[11px] font-bold"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-pen-green" aria-hidden />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" aria-hidden />
              Copy
            </>
          )}
        </button>
      </div>

      <div className="relative max-w-full overflow-x-auto scroll-slim">
        <SyntaxHighlighter
          language={language || "python"}
          style={inkTheme}
          wrapLongLines={false}
          customStyle={{
            background: "transparent",
            margin: 0,
            padding: "1rem 1.15rem",
            fontSize: "13.5px",
            lineHeight: 1.65,
          }}
          codeTagProps={{
            style: { fontFamily: "var(--font-mono), ui-monospace, monospace" },
          }}
        >
          {value}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}

/** Renders course markdown with GFM support and python code highlighting. */
export function MarkdownRenderer({ markdown }: { markdown: string }) {
  return (
    <div className="md-scope">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          pre({ children }) {
            // code blocks are fully handled by the `code` override
            return <>{children}</>;
          },
          code({ className, children, ...rest }) {
            const text = String(children ?? "").replace(/\n$/, "");
            const match = /language-(\w+)/.exec(className || "");
            if (match || text.includes("\n")) {
              return <CodeBlock language={match?.[1] ?? "python"} value={text} />;
            }
            return (
              <code className={className} {...rest}>
                {children}
              </code>
            );
          },
          a({ href, children, node: _node, ...rest }) {
            const external = href?.startsWith("http");
            return (
              <a
                href={href}
                {...rest}
                {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                {children}
              </a>
            );
          },
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
