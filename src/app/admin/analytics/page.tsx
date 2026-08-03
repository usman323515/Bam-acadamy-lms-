"use client";
import { useEffect, useState } from "react";
import Topbar from "@/components/Topbar";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";

type Analytics = {
  totalStudents: number; totalCourses: number; totalLessons: number; totalCertificates: number; completedLessons: number;
  registrationsByDay: { date: string; count: number }[];
  courseEnrollments: { title: string; enrollments: number }[];
};

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);

  useEffect(() => {
    fetch("/api/admin/analytics").then((r) => r.json()).then(setData);
  }, []);

  if (!data) return <><Topbar title="Analytics" /><p className="text-gray-500">Loading…</p></>;

  return (
    <>
      <Topbar title="Analytics" />
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <Stat label="Students" value={data.totalStudents} />
        <Stat label="Courses" value={data.totalCourses} />
        <Stat label="Lessons" value={data.totalLessons} />
        <Stat label="Lessons Completed" value={data.completedLessons} />
        <Stat label="Certificates" value={data.totalCertificates} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="font-semibold mb-4 text-sm">Registrations (last 30 days)</h2>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data.registrationsByDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#64748b" }} />
              <YAxis tick={{ fontSize: 10, fill: "#64748b" }} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "#1c2640", border: "1px solid rgba(255,255,255,0.1)" }} />
              <Line type="monotone" dataKey="count" stroke="#22c55e" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="card p-6">
          <h2 className="font-semibold mb-4 text-sm">Enrollments by Course</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.courseEnrollments}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="title" tick={{ fontSize: 10, fill: "#64748b" }} />
              <YAxis tick={{ fontSize: 10, fill: "#64748b" }} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "#1c2640", border: "1px solid rgba(255,255,255,0.1)" }} />
              <Bar dataKey="enrollments" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="card p-4">
      <div className="text-xl font-display font-bold">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}
