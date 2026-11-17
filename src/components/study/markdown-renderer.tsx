"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { Check, Copy, TerminalSquare } from "lucide-react";

/**
 * Syntax palette for the dark code surface: loud neo tokens —
 * red keywords, teal strings, purple functions, yellow numbers.
 */
const neoCodeTheme = {
  'code[class*="language-"]': {
    color: "#f2e9d8",
    textShadow: "none",
    fontFamily: "var(--font-mono), ui-monospace, monospace",
  },
  'pre[class*="language-"]': {
    background: "transparent",
  },
  comment: { color: "#948a79", fontStyle: "italic" },
  prolog: { color: "#948a79" },
  doctype: { color: "#948a79" },
  cdata: { color: "#948a79" },
  punctuation: { color: "#b5ab99" },
  property: { color: "#c9a6ff" },
  tag: { color: "#ff8f8f" },
  boolean: { color: "#ffd866" },
  number: { color: "#ffd866" },
  constant: { color: "#ffd866" },
  symbol: { color: "#ffd866" },
  deleted: { color: "#ff8f8f" },
  selector: { color: "#7ee8c7" },
  "attr-name": { color: "#c9a6ff" },
  string: { color: "#7ee8c7" },
  char: { color: "#7ee8c7" },
  builtin: { color: "#ff8f8f", fontWeight: "700" },
  inserted: { color: "#7ee8c7" },
  operator: { color: "#f2e9d8" },
  entity: { color: "#f2e9d8", cursor: "help" },
  url: { color: "#7ee8c7" },
  variable: { color: "#f2e9d8" },
  atrule: { color: "#c9a6ff" },
  "attr-value": { color: "#7ee8c7" },
  keyword: { color: "#ff8f8f", fontWeight: "700" },
  function: { color: "#c9a6ff" },
  "class-name": { color: "#ffd866" },
  regex: { color: "#ffd866" },
  important: { color: "#ff8f8f", fontWeight: "bold" },
};

/** Python code block: dark neo editor sheet with a black header strip. */
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
    <div className="my-5 overflow-hidden rounded-xl border-[3px] border-nb-border shadow-hard-sm">
      {/* header strip */}
      <div className="flex items-center justify-between gap-2 border-b-[3px] border-nb-border bg-nb-code-deep px-3 py-1.5">
        <span className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-wider text-nb-muted">
          <span className="h-2.5 w-2.5 rounded-full border-2 border-[#f2e9d8]/60 bg-nb-red" aria-hidden />
          {language || "python"}
        </span>
        <button
          onClick={copy}
          aria-label="Copy code"
          className="neo-btn min-h-[28px] rounded-lg px-2.5 py-0.5 font-mono text-[11px]"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-nb-green" aria-hidden />
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

      <div className="relative max-w-full overflow-x-auto scroll-slim bg-nb-code">
        <SyntaxHighlighter
          language={language || "python"}
          style={neoCodeTheme}
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
