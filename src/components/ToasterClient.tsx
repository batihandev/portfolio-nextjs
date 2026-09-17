"use client";

import { Toaster } from "react-hot-toast";

export const ToasterClient = () => (
  <Toaster
    position="bottom-center"
    toastOptions={{
      style: {
        background: "var(--paper)",
        color: "var(--ink)",
        border: "1.5px dashed var(--line)",
        fontWeight: 600,
      },
    }}
  />
);
