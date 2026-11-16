"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Check, Copy } from "lucide-react";

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
    <div className="my-5 overflow-hidden rounded-2xl border border-border/70 bg-[oklch(0.155_0.012_70)] shadow-inner">
      <div className="flex items-center justify-between border-b border-border/60 bg-secondary/40 px-4 py-2">
        <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
          <span className="flex gap-1.5" aria-hidden>
            <span className="h-2.5 w-2.5 rounded-full bg-[oklch(0.7_0.17_55)]/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-primary/50" />
            <span className="h-2.5 w-2.5 rounded-full bg-secondary" />
          </span>
          {language || "python"}
        </span>
        <button
          onClick={copy}
          aria-label="Copy code"
          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
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
        }}
        codeTagProps={{
          style: { fontFamily: "var(--font-jet-mono), ui-monospace, monospace" },
        }}
      >
        {value}
      </SyntaxHighlighter>
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
