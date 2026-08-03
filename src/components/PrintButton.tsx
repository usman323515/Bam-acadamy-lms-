"use client";
export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="fixed bottom-6 right-6 bg-brand-green text-black font-bold px-5 py-3 rounded-xl shadow-xl print:hidden"
    >
      <i className="fas fa-print mr-2" /> Print / Save as PDF
    </button>
  );
}
