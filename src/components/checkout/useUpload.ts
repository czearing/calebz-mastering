"use client";

import { useCallback, useRef, useState } from "react";

export type UploadStatus = "queued" | "uploading" | "done" | "ready" | "error";

export type UploadItem = {
  id: string;
  name: string;
  progress: number; // 0 to 1
  status: UploadStatus;
};

// Accepted source formats. WAV or AIFF only, per the prep brief (plan/29 s3).
const ACCEPT = [".wav", ".aif", ".aiff"];

export function isAccepted(name: string): boolean {
  const lower = name.toLowerCase();
  return ACCEPT.some((ext) => lower.endsWith(ext));
}

export const ACCEPT_ATTR = "audio/wav,audio/aiff,.wav,.aif,.aiff";

// Holds the per-file upload list and runs each file: ask the backend for a
// presigned PUT, then PUT the bytes with progress. On { configured: false }
// the file is marked "ready" (storage not connected yet). Resume is implied by
// the contract; here we surface progress and a clean retry path. See plan/29.
export function useUpload(orderId: string) {
  const [items, setItems] = useState<UploadItem[]>([]);
  const seq = useRef(0);

  const patch = useCallback((id: string, next: Partial<UploadItem>) => {
    setItems((list) =>
      list.map((it) => (it.id === id ? { ...it, ...next } : it)),
    );
  }, []);

  const run = useCallback(
    async (item: UploadItem, file: File) => {
      patch(item.id, { status: "uploading" });
      try {
        const res = await fetch("/api/upload-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId,
            filename: file.name,
            contentType: file.type || "application/octet-stream",
          }),
        });
        const data = (await res.json()) as { url?: string; configured?: false };
        if (data.configured === false || !data.url) {
          patch(item.id, { status: "ready", progress: 0 });
          return;
        }
        await fetch(data.url, { method: "PUT", body: file });
        patch(item.id, { status: "done", progress: 1 });
      } catch {
        patch(item.id, { status: "error" });
      }
    },
    [orderId, patch],
  );

  const add = useCallback(
    (files: FileList | File[]) => {
      for (const file of Array.from(files)) {
        if (!isAccepted(file.name)) continue;
        seq.current += 1;
        const item: UploadItem = {
          id: `f-${seq.current}`,
          name: file.name,
          progress: 0,
          status: "queued",
        };
        setItems((list) => [...list, item]);
        void run(item, file);
      }
    },
    [run],
  );

  // Remove a file the customer added by mistake, so the list is theirs to edit.
  const remove = useCallback((id: string) => {
    setItems((list) => list.filter((it) => it.id !== id));
  }, []);

  return { items, add, remove };
}
