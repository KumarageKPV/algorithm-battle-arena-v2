"use client";
import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { adminApi } from "@/lib/api";

export default function AdminUsersPanel() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 25;

  const loadUsers = async () => {
    setLoading(true);
    try {
      const r = await adminApi.getUsers({ q: search, role: role || undefined, page: String(page), pageSize: String(pageSize) } as any);
      setUsers(r.data.items || []); setTotal(r.data.total || 0);
    } catch { alert("Failed to load users"); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadUsers(); }, [search, role, page]);
  useEffect(() => { setPage(1); }, [search, role]);

  const handleToggle = async (u: any) => {
    const action = u.isActive ? "deactivate" : "activate";
    if (!confirm(`Are you sure you want to ${action} ${u.name}?`)) return;
    try { await adminApi.toggleUserActive(u.id, u.isActive); alert(`User ${action}d`); loadUsers(); } catch { alert("Failed"); }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-4">
      <div className="flex gap-3 items-center">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users..."
            className="w-full pl-10 pr-4 py-2 rounded-lg text-white text-sm" style={{ background: "rgba(40,40,40,0.9)", border: "1px solid #666", fontFamily: "'Courier New', monospace" }} />
        </div>
        <select value={role} onChange={(e) => setRole(e.target.value)}
          className="px-3 py-2 rounded-lg text-white text-sm" style={{ background: "rgba(40,40,40,0.9)", border: "1px solid #666" }}>
          <option value="">All Roles</option>
          <option value="Student">Student</option>
          <option value="Teacher">Teacher</option>
        </select>
      </div>

      {loading ? <p className="text-gray-500 text-center py-8">Loading...</p> : (
        <div className="rounded-xl overflow-hidden" style={{ background: "rgba(20,20,20,0.85)", border: "1px solid #333" }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="px-4 py-3 text-left" style={{ color: "#ffed4e" }}>Name</th>
                <th className="px-4 py-3 text-left" style={{ color: "#ffed4e" }}>Email</th>
                <th className="px-4 py-3 text-left" style={{ color: "#ffed4e" }}>Role</th>
                <th className="px-4 py-3 text-left" style={{ color: "#ffed4e" }}>Status</th>
                <th className="px-4 py-3 text-right" style={{ color: "#ffed4e" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="px-4 py-3 text-white">{u.name}</td>
                  <td className="px-4 py-3 text-gray-400">{u.email}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded ${u.role === "Student" ? "bg-blue-900 text-blue-400" : "bg-purple-900 text-purple-400"}`}>{u.role}</span></td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded ${u.isActive ? "bg-green-900 text-green-400" : "bg-red-900 text-red-400"}`}>{u.isActive ? "Active" : "Inactive"}</span></td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleToggle(u)} className={`px-3 py-1 rounded text-xs font-bold ${u.isActive ? "bg-red-600 text-white" : "bg-green-600 text-white"}`}>
                      {u.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">No users found</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">{total} total users</span>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="px-3 py-1 rounded bg-gray-800 text-gray-300 disabled:opacity-50">Prev</button>
            <span className="px-3 py-1 text-gray-400">Page {page} of {totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="px-3 py-1 rounded bg-gray-800 text-gray-300 disabled:opacity-50">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}


