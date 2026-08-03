"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function VerifyEmailInner() {
  const params = useSearchParams();
  const token = params.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Missing verification token.");
      return;
    }
    fetch(`/api/auth/verify-email?token=${token}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setStatus("success");
        setMessage(data.message);
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err.message || "Verification failed.");
      });
  }, [token]);

  return (
    <div className="text-center">
      {status === "loading" && <p className="text-gray-400">Verifying your email…</p>}
      {status === "success" && (
        <>
          <div className="text-4xl mb-3">✅</div>
          <h1 className="text-lg font-bold mb-2">Email verified!</h1>
          <p className="text-gray-400 text-sm mb-6">{message}</p>
          <Link href="/login" className="btn-primary inline-block">Go to Login</Link>
        </>
      )}
      {status === "error" && (
        <>
          <div className="text-4xl mb-3">⚠️</div>
          <h1 className="text-lg font-bold mb-2">Verification failed</h1>
          <p className="text-gray-400 text-sm mb-6">{message}</p>
          <Link href="/login" className="btn-secondary inline-block">Back to Login</Link>
        </>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<p className="text-gray-400 text-center">Loading…</p>}>
      <VerifyEmailInner />
    </Suspense>
  );
}
