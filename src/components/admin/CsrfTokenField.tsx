"use client";

import { useEffect } from "react";
import { getBrowserCsrfToken } from "@/lib/csrf";

export function CsrfTokenField({ name = "csrfToken" }: { name?: string }) {
  useEffect(() => {
    let active = true;

    async function syncToken() {
      const existing = getBrowserCsrfToken();
      if (!existing) {
        try {
          await fetch("/api/admin/csrf", { credentials: "same-origin" });
        } catch {
          return;
        }
      }

      if (!active) return;
      const token = getBrowserCsrfToken();
      const fields = Array.from(document.querySelectorAll<HTMLInputElement>(`input[name="${name}"]`));
      fields.forEach((field) => {
        field.value = token ?? "";
      });
    }

    void syncToken();
    return () => {
      active = false;
    };
  }, [name]);

  return null;
}
