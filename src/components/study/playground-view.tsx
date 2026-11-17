"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ExternalLink, Loader2 } from "lucide-react";
import { useStudyStore } from "@/lib/store";

/**
 * Hosts the standalone Python playground (public/playground/index.html)
 * inside the app. The playground runs Pyodide + CodeMirror fully on the
 * client; this view only wires the iframe and passes queued exercise code
 * into it via postMessage.
 */
export function PlaygroundView() {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [frameReady, setFrameReady] = useState(false);
  const pendingCode = useStudyStore((s) => s.pendingLabCode);
  const consumeLabCode = useStudyStore((s) => s.consumeLabCode);

  const pushCode = useCallback(() => {
    const code = useStudyStore.getState().pendingLabCode;
    if (code !== null && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: "set-code", code }, "*");
      consumeLabCode();
    }
  }, [consumeLabCode]);

  useEffect(() => {
    if (frameReady) pushCode();
  }, [frameReady, pendingCode, pushCode]);

  return (
    <div className="space-y-3 pt-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Code Lab</h1>
        <a
          href="/playground/index.html"
          target="_blank"
          rel="noopener noreferrer"
          className="btn3d btn-paper inline-flex min-h-[40px] items-center gap-2 rounded-xl px-4 text-sm font-bold"
        >
          <ExternalLink className="h-4 w-4 text-pen-blue" aria-hidden />
          Open full screen
        </a>
      </div>

      <div className="sheet relative overflow-hidden rounded-2xl p-2 sm:p-3">
        <span className="washi" aria-hidden />
        {!frameReady && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-2xl bg-card">
            <Loader2 className="h-6 w-6 animate-spin text-pen-blue" aria-hidden />
            <p className="text-sm font-semibold text-pencil">Preparing the lab…</p>
          </div>
        )}
        <iframe
          ref={iframeRef}
          src="/playground/index.html"
          title="Python Code Lab"
          className="h-[72vh] min-h-[520px] w-full rounded-xl border border-ink/15 bg-white md:h-[calc(100vh-150px)] md:min-h-[640px]"
          onLoad={() => setFrameReady(true)}
        />
      </div>
    </div>
  );
}
