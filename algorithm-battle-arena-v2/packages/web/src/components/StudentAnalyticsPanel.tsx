"use client";
import { useState, useEffect } from "react";
import { BarChart, TrendingUp, Clock, Trophy, Code, Target } from "lucide-react";
import { studentsApi } from "@/lib/api";

const MetricCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) => (
  <div className="rounded-xl p-4" style={{ background: "rgba(20,20,20,0.85)", border: "1px solid #333" }}>
    <div style={{ color: "#ff6b00" }}>{icon}</div>
    <h4 className="text-sm font-medium text-gray-300 mt-2">{label}</h4>
    <p className="text-2xl font-bold" style={{ color: "#ffed4e" }}>{value}</p>
  </div>
);

export default function StudentAnalyticsPanel() {
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentsApi.getStudents().then((r) => setStudents(r.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const fetchAnalytics = async (studentId: number) => {
    setLoading(true);
    try {
      const [aRes, sRes] = await Promise.all([studentsApi.getAnalytics(studentId), studentsApi.getSubmissions(studentId)]);
      setAnalytics(aRes.data); setSubmissions(sRes.data || []);
    } catch { console.error("Failed to load analytics"); }
    finally { setLoading(false); }
  };

  const handleSelect = (studentId: number) => { setSelectedStudent(studentId); fetchAnalytics(studentId); };

  return (
    <div className="space-y-6">
      {/* Student Picker */}
      <div className="rounded-xl p-4" style={{ background: "rgba(20,20,20,0.85)", border: "1px solid #333" }}>
        <h3 className="font-bold mb-3" style={{ color: "#ffed4e", fontFamily: "'Courier New', monospace" }}>Select Student</h3>
        {students.length === 0 ? <p className="text-gray-500 text-sm">No accepted students</p> : (
          <div className="flex flex-wrap gap-2">
            {students.map((s: any) => (
              <button key={s.studentId || s.requestId} onClick={() => handleSelect(s.studentId)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${selectedStudent === s.studentId ? "bg-arena-orange text-black" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}>
                {s.firstName} {s.lastName}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Analytics */}
      {analytics && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <MetricCard icon={<Trophy size={24} />} label="Total Score" value={analytics.totalScore ?? 0} />
            <MetricCard icon={<Target size={24} />} label="Problems Solved" value={analytics.problemsSolved ?? 0} />
            <MetricCard icon={<Code size={24} />} label="Submissions" value={analytics.totalSubmissions ?? 0} />
            <MetricCard icon={<TrendingUp size={24} />} label="Success Rate" value={`${(analytics.successRate ?? 0).toFixed(0)}%`} />
            <MetricCard icon={<Clock size={24} />} label="Avg Time" value={`${(analytics.avgTime ?? 0).toFixed(1)}s`} />
            <MetricCard icon={<BarChart size={24} />} label="Matches Played" value={analytics.matchesPlayed ?? 0} />
          </div>

          {/* Submission History */}
          {submissions.length > 0 && (
            <div className="rounded-xl overflow-hidden" style={{ background: "rgba(20,20,20,0.85)", border: "1px solid #333" }}>
              <div className="p-4 border-b border-gray-800">
                <h3 className="font-bold" style={{ color: "#ffed4e", fontFamily: "'Courier New', monospace" }}>Submission History</h3>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="px-4 py-2 text-left text-gray-400">Problem</th>
                    <th className="px-4 py-2 text-left text-gray-400">Language</th>
                    <th className="px-4 py-2 text-left text-gray-400">Status</th>
                    <th className="px-4 py-2 text-left text-gray-400">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.slice(0, 20).map((s: any, i: number) => (
                    <tr key={i} className="border-b border-gray-800/50">
                      <td className="px-4 py-2 text-white">{s.problemTitle || `Problem #${s.problemId}`}</td>
                      <td className="px-4 py-2 text-gray-400">{s.language}</td>
                      <td className="px-4 py-2"><span className={`text-xs px-2 py-0.5 rounded ${s.status === "Accepted" ? "bg-green-900 text-green-400" : "bg-red-900 text-red-400"}`}>{s.status}</span></td>
                      <td className="px-4 py-2 text-arena-orange font-bold">{s.score ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {loading && selectedStudent && <p className="text-gray-500 text-center py-8">Loading analytics...</p>}
    </div>
  );
}


