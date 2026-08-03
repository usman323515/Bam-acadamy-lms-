import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import PrintButton from "@/components/PrintButton";

export default async function CertificatePrintPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) notFound();

  const cert = await prisma.certificate.findUnique({
    where: { id: params.id },
    include: { course: true, user: true },
  });
  if (!cert || (cert.userId !== session.user.id && session.user.role !== "ADMIN")) notFound();

  return (
    <div className="min-h-screen bg-white text-[#1a1a2e] flex items-center justify-center p-6">
      <div className="w-full max-w-3xl border-[10px] border-[#f59e0b] rounded-2xl p-12 text-center relative">
        <div className="text-xs tracking-[4px] text-gray-500 mb-2">CERTIFICATE OF COMPLETION</div>
        <div className="font-serif text-3xl font-bold mb-6">BAM Academy</div>
        <p className="text-gray-500 mb-1">This certifies that</p>
        <div className="text-3xl font-bold my-3" style={{ fontFamily: "Georgia, serif" }}>{cert.user.name}</div>
        <p className="text-gray-500 mb-6">has successfully completed the course</p>
        <div className="text-xl font-semibold mb-8">{cert.course.title}</div>
        <div className="flex justify-between items-end mt-12 text-sm text-gray-500">
          <div>Certificate No.<br /><span className="text-black font-medium">{cert.certificateNo}</span></div>
          <div>Issued<br /><span className="text-black font-medium">{format(new Date(cert.issuedAt), "MMM d, yyyy")}</span></div>
        </div>
      </div>
      <PrintButton />
    </div>
  );
}
