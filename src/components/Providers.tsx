"use client";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Toaster
        position="top-center"
        toastOptions={{
          style: { background: "#1c2640", color: "#fff", border: "1px solid rgba(255,255,255,0.1)" },
        }}
      />
    </SessionProvider>
  );
}
