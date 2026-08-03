import { prisma } from "@/lib/prisma";
import Topbar from "@/components/Topbar";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default async function AdminDashboard() {
  const [studentCount, courseCount, blockedCount, recentStudents, certCount] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.course.count(),
    prisma.user.count({ where: { role: "STUDENT", isBlocked: true } }),
    prisma.user.findMany({ where: { role: "STUDENT" }, orderBy: { createdAt: "desc" }, take: 6 }),
    prisma.certificate.count(),
  ]);

  return (
    <>
      <Topbar title="Admin Overview" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon="fa-users" label="Total Students" value={studentCount} color="text-brand-blue" />
        <StatCard icon="fa-book" label="Courses" value={courseCount} color="text-brand-green2" />
        <StatCard icon="fa-user-slash" label="Blocked Students" value={blockedCount} color="text-brand-red" />
        <StatCard icon="fa-certificate" label="Certificates Issued" value={certCount} color="text-brand-gold" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Recent Registrations</h2>
            <Link href="/admin/students" className="text-xs text-brand-green2 hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {recentStudents.map((s) => (
              <div key={s.id} className="flex items-center justify-between text-sm">
                <div>
                  <div className="font-medium">{s.name}</div>
                  <div className="text-gray-500 text-xs">{s.email}</div>
                </div>
                <div className="text-gray-500 text-xs">{formatDistanceToNow(new Date(s.createdAt), { addSuffix: true })}</div>
              </div>
            ))}
            {recentStudents.length === 0 && <p className="text-gray-500 text-sm">No students yet.</p>}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/admin/courses" className="btn-secondary text-center text-sm">Manage Courses</Link>
            <Link href="/admin/students" className="btn-secondary text-center text-sm">Manage Students</Link>
            <Link href="/admin/announcements" className="btn-secondary text-center text-sm">Send Announcement</Link>
            <Link href="/admin/analytics" className="btn-secondary text-center text-sm">View Analytics</Link>
          </div>
        </div>
      </div>
    </>
  );
}

function StatCard({ icon, label, value, color }: { icon: string; label: string; value: string | number; color: string }) {
  return (
    <div className="card p-4">
      <i className={`fas ${icon} ${color} mb-2`} />
      <div className="text-xl font-display font-bold">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}
