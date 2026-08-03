"use client";
import { useEffect, useState } from "react";
import Topbar from "@/components/Topbar";
import Link from "next/link";
import toast from "react-hot-toast";
import { format } from "date-fns";

type Student = {
  id: string; name: string; email: string; isBlocked: boolean; emailVerified: boolean;
  createdAt: string; lastLogin: string | null; coursesEnrolled: number; certificates: number;
};

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/admin/students?q=${encodeURIComponent(q)}`);
    if (res.ok) setStudents(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  async function toggleBlock(id: string, isBlocked: boolean) {
    const res = await fetch(`/api/admin/students/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isBlocked: !isBlocked }),
    });
    if (res.ok) {
      setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, isBlocked: !isBlocked } : s)));
      toast.success(!isBlocked ? "Student blocked" : "Student unblocked");
    }
  }

  async function remove(id: string) {
    if (!confirm("Permanently delete this student and all their progress? This cannot be undone.")) return;
    const res = await fetch(`/api/admin/students/${id}`, { method: "DELETE" });
    if (res.ok) {
      setStudents((prev) => prev.filter((s) => s.id !== id));
      toast.success("Student deleted");
    }
  }

  return (
    <>
      <Topbar title="Student Management" />
      <div className="mb-5">
        <input
          className="input-field max-w-sm"
          placeholder="Search by name or email…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-line">
              <th className="p-4">Student</th>
              <th className="p-4">Registered</th>
              <th className="p-4">Last Login</th>
              <th className="p-4">Courses</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id} className="border-b border-line last:border-0">
                <td className="p-4">
                  <Link href={`/admin/students/${s.id}`} className="font-medium hover:text-brand-green2">{s.name}</Link>
                  <div className="text-gray-500 text-xs">{s.email}</div>
                </td>
                <td className="p-4 text-gray-400">{format(new Date(s.createdAt), "MMM d, yyyy")}</td>
                <td className="p-4 text-gray-400">{s.lastLogin ? format(new Date(s.lastLogin), "MMM d, yyyy HH:mm") : "Never"}</td>
                <td className="p-4 text-gray-400">{s.coursesEnrolled}</td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.isBlocked ? "bg-red-500/15 text-red-400" : "bg-brand-green/15 text-brand-green2"}`}>
                    {s.isBlocked ? "Blocked" : "Active"}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button onClick={() => toggleBlock(s.id, s.isBlocked)} className="text-xs px-2.5 py-1.5 rounded-lg bg-card2 hover:bg-bg2 border border-line">
                      {s.isBlocked ? "Unblock" : "Block"}
                    </button>
                    <button onClick={() => remove(s.id)} className="text-xs px-2.5 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && students.length === 0 && (
              <tr><td colSpan={6} className="p-8 text-center text-gray-500">No students found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
