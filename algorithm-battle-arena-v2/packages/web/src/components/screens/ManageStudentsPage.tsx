import { useState, useEffect } from "react";
import { Card, Chip, StatTile } from "../primitives/Bits";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { studentsApi } from "../../lib/api";
import { STUDENTS } from "../../lib/data";
import { Search, Plus, Download, MoreHorizontal, MessageSquare, Filter, Users } from "lucide-react";

export function ManageStudentsPage({ onChat }: { onChat: () => void }) {
  const [sel, setSel] = useState<number[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [studentsPage, setStudentsPage] = useState(0);
  const STUDENTS_PER_PAGE = 8;

  useEffect(() => {
    studentsApi.getStudents()
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setStudents(res.data);
        } else {
          setStudents(STUDENTS);
        }
      })
      .catch((err) => {
        console.error("Failed to load students:", err);
        setStudents(STUDENTS);
      });
  }, []);

  const enrolled = students.length;
  const online = students.filter(s => s.status === "Online").length;
  const atRisk = students.filter(s => s.risk && s.risk !== "low").length;
  const activePercent = enrolled > 0 ? Math.round((online / enrolled) * 100) : 0;

  const toggle = (id: number) => setSel(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground">ROSTER · CS204</div>
          <h1 className="font-display text-[26px] font-semibold">Manage students</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="bg-white"><Download className="size-4" /> Export</Button>
          <Button className="bg-primary hover:bg-[#C62828]"><Plus className="size-4" /> Invite student</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="ENROLLED" value={enrolled.toString()} sub="across 2 cohorts" accent="primary" />
        <StatTile label="ONLINE NOW" value={online.toString()} sub={`${activePercent}% engaged`} accent="success" />
        <StatTile label="AT RISK" value={atRisk.toString()} sub="needs follow-up" accent="tension" />
        <StatTile label="AVG. STREAK" value="4.2 W" sub="rising" accent="warning" />
      </div>

      <Card>
        <div className="flex flex-wrap items-center gap-2 border-b border-border p-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search by name, email, handle…" className="h-9 bg-[var(--input-background)] pl-9" />
          </div>
          <div className="flex gap-1">
            {["All", "Online", "At risk", "Top 10", "CS204-A", "CS204-B"].map((f, i) => (
              <button key={f} className={`h-8 rounded-md px-2.5 text-xs ${i === 0 ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>{f}</button>
            ))}
          </div>
          <Button variant="outline" className="ml-auto h-8 bg-white text-xs"><Filter className="size-3.5" /> More</Button>
        </div>

        {/* Bulk bar */}
        {sel.length > 0 && (
          <div className="flex items-center gap-3 border-b border-primary/20 bg-primary/[0.04] px-4 py-2 text-sm">
            <Users className="size-4 text-primary" />
            <span><b>{sel.length}</b> selected</span>
            <Button size="sm" variant="outline" className="bg-white"><MessageSquare className="size-3.5" /> Message</Button>
            <Button size="sm" variant="outline" className="bg-white">Assign challenge</Button>
            <Button size="sm" variant="outline" className="bg-white">Move cohort</Button>
            <button onClick={() => setSel([])} className="ml-auto text-xs text-muted-foreground hover:text-foreground">Clear</button>
          </div>
        )}

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              <th className="w-10 px-4 py-2.5"><input type="checkbox" className="accent-primary" /></th>
              <th className="px-4 py-2.5 text-left">Student</th>
              <th className="px-4 py-2.5 text-left">Cohort</th>
              <th className="px-4 py-2.5 text-left">Status</th>
              <th className="px-4 py-2.5 text-right">SR</th>
              <th className="px-4 py-2.5 text-left">Last active</th>
              <th className="px-4 py-2.5 text-left">Health</th>
              <th className="w-10 px-4 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {students.slice(studentsPage * STUDENTS_PER_PAGE, (studentsPage + 1) * STUDENTS_PER_PAGE).map(s => {
              const fullName = s.studentId ? `${s.firstName} ${s.lastName}` : s.name;
              const email = s.email;
              const id = s.studentId || s.id;
              const cohort = s.cohort || "-";
              const status = s.status || "Online";
              const rating = s.rating || "Unranked";
              const last = s.last || "Just now";
              const risk = s.risk || "low";
              return (
                <tr key={id} className={`border-b border-border last:border-0 hover:bg-muted/30 ${sel.includes(id) ? "bg-primary/[0.04]" : ""}`}>
                  <td className="px-4 py-2.5"><input type="checkbox" checked={sel.includes(id)} onChange={() => toggle(id)} className="accent-primary" /></td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <Avatar className="size-8"><AvatarFallback className="bg-primary/10 text-primary text-[11px]">{fullName.split(" ").map((x: string) => x[0]).join("")}</AvatarFallback></Avatar>
                      <div>
                        <div className="font-medium">{fullName}</div>
                        <div className="font-mono text-[10px] text-muted-foreground">{email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{cohort}</td>
                  <td className="px-4 py-2.5">
                    <span className="inline-flex items-center gap-1.5 text-xs">
                      <span className={`size-1.5 rounded-full ${status === "Online" ? "bg-success" : status === "Offline" ? "bg-muted-foreground" : "bg-primary"}`} />
                      {status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right font-display font-semibold tabular-nums">{rating}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{last}</td>
                  <td className="px-4 py-2.5"><Chip tone={risk === "low" ? "success" : risk === "medium" ? "warning" : "tension"}>{risk} risk</Chip></td>
                  <td className="px-4 py-2.5">
                    <button onClick={onChat} className="grid size-7 place-items-center rounded-md hover:bg-muted"><MoreHorizontal className="size-4 text-muted-foreground" /></button>
                  </td>
                </tr>
              );
            })}
            {students.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-xs text-muted-foreground">No students enrolled yet.</td>
              </tr>
            )}
          </tbody>
        </table>

        {students.length > 0 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-2.5 text-xs text-muted-foreground">
            <span>
              Showing {studentsPage * STUDENTS_PER_PAGE + 1}–{Math.min((studentsPage + 1) * STUDENTS_PER_PAGE, students.length)} of {students.length}
            </span>
            <div className="flex gap-1">
              <Button 
                size="sm" 
                variant="outline" 
                className="h-7 bg-white" 
                disabled={studentsPage === 0} 
                onClick={() => setStudentsPage(p => p - 1)}
              >
                Prev
              </Button>
              <Button size="sm" className="h-7 bg-primary hover:bg-[#C62828] cursor-default">{studentsPage + 1}</Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="h-7 bg-white" 
                disabled={(studentsPage + 1) * STUDENTS_PER_PAGE >= students.length} 
                onClick={() => setStudentsPage(p => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
