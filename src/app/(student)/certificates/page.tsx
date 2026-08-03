import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Topbar from "@/components/Topbar";
import { format } from "date-fns";

export default async function CertificatesPage() {
  const session = await getServerSession(authOptions);
  const certificates = await prisma.certificate.findMany({
    where: { userId: session!.user.id },
    include: { course: true },
    orderBy: { issuedAt: "desc" },
  });

  return (
    <>
      <Topbar title="Certificates" />
      {certificates.length === 0 ? (
        <div className="card p-10 text-center text-gray-500">
          <i className="fas fa-certificate text-3xl mb-3 text-gray-600" />
          <p>Complete a course to earn your first certificate.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-5">
          {certificates.map((cert) => (
            <div key={cert.id} className="card p-6 bg-gradient-to-br from-brand-gold/10 to-transparent">
              <i className="fas fa-award text-3xl text-brand-gold mb-3" />
              <h3 className="font-display font-bold mb-1">{cert.course.title}</h3>
              <p className="text-xs text-gray-500 mb-1">Certificate No: {cert.certificateNo}</p>
              <p className="text-xs text-gray-500 mb-4">Issued {format(new Date(cert.issuedAt), "MMM d, yyyy")}</p>
              <a href={`/certificates/${cert.id}/print`} target="_blank" className="btn-secondary inline-block text-sm">
                <i className="fas fa-download mr-1" /> View / Print
              </a>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
