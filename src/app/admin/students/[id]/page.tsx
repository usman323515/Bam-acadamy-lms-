import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Topbar from "@/components/Topbar";
import { format } from "date-fns";

export default async function StudentDetailPage({ params }: { params: { id: string } }) {
  const student = await prisma.user.findUnique({
    where: { id: params.id },
    include: {
      loginEvents: { orderBy: { createdAt: "desc" }, take: 20 },
      enrollments: { include: { course: true } },
      certificates: { include: { course: true } },
    },
  });
  if (!student || student.role !== "STUDENT") notFound();

  return (
    <>
      <Topbar title={student.name} />
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="font-semibold mb-4">Details</h2>
          <dl className="space-y-2 text-sm">
            <Row label="Email" value={student.email} />
            <Row label="Registered" value={format(new Date(student.createdAt), "MMM d, yyyy HH:mm")} />
            <Row label="Email Verified" value={student.emailVerified ? "Yes" : "No"} />
            <Row label="Status" value={student.isBlocked ? "Blocked" : "Active"} />
            <Row label="Courses Enrolled" value={String(student.enrollments.length)} />
            <Row label="Certificates" value={String(student.certificates.length)} />
          </dl>
        </div>
        <div className="card p-6">
          <h2 className="font-semibold mb-4">Login History</h2>
          <div className="space-y-2 max-h-72 overflow-y-auto text-sm">
            {student.loginEvents.map((e) => (
              <div key={e.id} className="flex justify-between text-gray-400 border-b border-line pb-2">
                <span>{format(new Date(e.createdAt), "MMM d, yyyy HH:mm")}</span>
                <span className="text-xs">{e.ipAddress || "unknown IP"}</span>
              </div>
            ))}
            {student.loginEvents.length === 0 && <p className="text-gray-500">No login history yet.</p>}
          </div>
        </div>
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-line pb-2">
      <dt className="text-gray-500">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
