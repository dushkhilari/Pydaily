"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Check, Copy, TerminalSquare } from "lucide-react";
import { Screws } from "./textures";

/** Python code on a CRT bench screen: plastic bezel, metal nameplate, olive LCD. */
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
    <div className="relative my-5 rounded-2xl border border-black/30 bg-bezel-mat p-2.5 shadow-[0_2px_5px_oklch(0.35_0.05_55/0.35),0_14px_28px_-14px_oklch(0.3_0.05_55/0.45)]">
      <Screws inset={7} />

      {/* brushed-metal nameplate */}
      <div className="relative z-[3] flex items-center justify-between gap-2 rounded-lg border border-black/25 bg-metal-mat px-3 py-1.5 shadow-[0_1px_0_oklch(1_0_0/55%)_inset]">
        <span className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-wider text-foreground/60">
          <TerminalSquare className="h-3.5 w-3.5" aria-hidden />
          {language || "python"}
        </span>
        <button
          onClick={copy}
          aria-label="Copy code"
          className="btn3d btn-key inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-mono text-[11px] font-bold"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-primary" aria-hidden />
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

      {/* olive CRT screen */}
      <div className="lcd-screen mt-2 rounded-lg">
        <div className="relative z-[3] max-w-full overflow-x-auto scroll-slim">
          <SyntaxHighlighter
            language={language || "python"}
            style={oneDark}
            wrapLongLines={false}
            customStyle={{
              background: "transparent",
              margin: 0,
              padding: "1rem 1.15rem",
              fontSize: "13.5px",
              lineHeight: 1.65,
              textShadow: "0 0 6px oklch(0.85 0.1 120 / 22%)",
            }}
            codeTagProps={{
              style: { fontFamily: "var(--font-mono), ui-monospace, monospace" },
            }}
          >
            {value}
          </SyntaxHighlighter>
        </div>
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
