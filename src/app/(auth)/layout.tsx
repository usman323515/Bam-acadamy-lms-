export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4 py-10 relative overflow-hidden">
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-brand-green/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-brand-blue/10 rounded-full blur-3xl" />
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 font-display font-extrabold text-2xl">
            <span className="text-brand-green">BAM</span>
            <span className="text-white">Academy</span>
          </div>
          <p className="text-gray-500 text-sm mt-1">Business African Marketing</p>
        </div>
        <div className="card p-8">{children}</div>
      </div>
    </div>
  );
}
