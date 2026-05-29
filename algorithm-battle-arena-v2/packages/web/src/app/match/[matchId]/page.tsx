"use client";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import ResultsModal from "@/components/ResultsModal";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import MatchChatPanel from "@/components/chat/MatchChatPanel";
import { submissionsApi, problemsApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import codeExecutor from "@/lib/codeExecutor";
import dynamic from "next/dynamic";
import { Clock, Send, LogOut, Play, ChevronDown, ChevronRight, CheckCircle, XCircle, MessageCircle } from "lucide-react";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

export default function MatchPage() {
  const params = useParams();
  const matchId = params?.matchId as string;
  const { user } = useAuth();
  const router = useRouter();

  const [code, setCode] = useState("// Write your solution here\n");
  const [language, setLanguage] = useState("javascript");
  const [timeLeft, setTimeLeft] = useState(600);
  const [problems, setProblems] = useState<any[]>([]);
  const [activeProblemIdx, setActiveProblemIdx] = useState(0);
  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [runResults, setRunResults] = useState<any>(null);
  const [currentScore, setCurrentScore] = useState(0);
  const [problemsCompleted, setProblemsCompleted] = useState(0);
  const [expandedTests, setExpandedTests] = useState<Record<number, boolean>>({});
  const timerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => { if (prev <= 0) { clearInterval(timerRef.current); return 0; } return prev - 1; });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  // Load problems for this match (simplified — v1 gets them from match state)
  useEffect(() => {
    problemsApi.getAll({ page: "1", pageSize: "5" }).then((r) => {
      if (r.data.problems?.length) setProblems(r.data.problems);
    }).catch(() => {});
  }, []);

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const activeProblem = problems[activeProblemIdx];

  const handleRun = async () => {
    if (!activeProblem?.sampleTestCases) { alert("No test cases available"); return; }
    const result = await codeExecutor.runSample(code, activeProblem.sampleTestCases);
    setRunResults(result);
  };

  const handleSubmit = async () => {
    if (!activeProblem) { alert("No problem selected"); return; }
    try {
      const res = await submissionsApi.create({
        matchId: parseInt(matchId), problemId: activeProblem.problemId, language, code, status: "Submitted", score: 0,
      });
      setResults(res.data);
      setShowResults(true);
      if (res.data?.score >= 70) setProblemsCompleted((p) => p + 1);
      setCurrentScore((s) => Math.max(s, res.data?.score || 0));
    } catch { alert("Submit failed"); }
  };

  const handleLeaveConfirm = () => { setShowConfirm(false); router.push("/lobby"); };

  return (
    <ProtectedRoute>
      <div className="h-screen flex flex-col" style={{ background: "linear-gradient(135deg, #111827 0%, #1a0000 50%, #000 100%)" }}>
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-2" style={{ background: "rgba(0,0,0,0.7)", borderBottom: "2px solid #ff6b00" }}>
          <h1 style={{ fontFamily: "'MK4', Impact, sans-serif", fontSize: "1.3rem", color: "#ffed4e" }}>MATCH #{matchId}</h1>
          <div className="flex items-center gap-3">
            <select value={language} onChange={(e) => setLanguage(e.target.value)}
              className="text-white text-sm rounded px-2 py-1" style={{ background: "rgba(40,40,40,0.9)", border: "1px solid #666" }}>
              <option value="javascript">JavaScript</option><option value="python">Python</option><option value="java">Java</option><option value="cpp">C++</option>
            </select>
            <div className={`flex items-center gap-1 font-mono text-lg ${timeLeft < 60 ? "text-red-400 animate-pulse" : ""}`} style={{ color: timeLeft >= 60 ? "#ffed4e" : undefined }}>
              <Clock size={16} /> {fmt(timeLeft)}
            </div>
            <button onClick={handleRun} className="px-3 py-1.5 font-bold rounded-lg text-sm flex items-center gap-1"
              style={{ background: "rgba(40,40,40,0.9)", border: "1px solid #666", color: "#22c55e" }}>
              <Play size={14} /> Run
            </button>
            <button onClick={handleSubmit} className="px-4 py-1.5 font-bold rounded-lg text-sm flex items-center gap-1"
              style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)", color: "#fff" }}>
              <Send size={14} /> Submit
            </button>
            <button onClick={() => setShowChat(!showChat)} className="px-3 py-1.5 rounded-lg text-sm bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1">
              <MessageCircle size={14} />
            </button>
            <button onClick={() => setShowConfirm(true)} className="px-3 py-1.5 rounded-lg text-sm flex items-center gap-1"
              style={{ background: "#6B0F1A", color: "#fff", border: "1px solid #4a0a0e" }}>
              <LogOut size={14} /> Exit
            </button>
          </div>
        </div>

        {/* Main Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Problem Panel */}
          <div className="w-96 overflow-y-auto p-4" style={{ borderRight: "2px solid #333" }}>
            {/* Problem Tabs */}
            <div className="flex gap-1 mb-4 flex-wrap">
              {problems.map((p, i) => (
                <button key={p.problemId} onClick={() => setActiveProblemIdx(i)}
                  className={`px-3 py-1 rounded text-xs font-bold ${i === activeProblemIdx ? "bg-arena-orange text-black" : "bg-gray-800 text-gray-400"}`}>
                  P{i + 1}
                </button>
              ))}
            </div>

            {activeProblem ? (
              <div>
                <h2 className="text-lg font-bold mb-2" style={{ color: "#ffed4e" }}>{activeProblem.title}</h2>
                <span className={`text-xs px-2 py-0.5 rounded mb-3 inline-block ${activeProblem.difficultyLevel === "Easy" ? "bg-green-900 text-green-400" : activeProblem.difficultyLevel === "Hard" ? "bg-red-900 text-red-400" : "bg-yellow-900 text-yellow-400"}`}>
                  {activeProblem.difficultyLevel}
                </span>
                <div className="prose prose-invert text-sm mt-3" style={{ fontFamily: "'Courier New', monospace", color: "#ccc" }}>
                  <p className="whitespace-pre-wrap">{activeProblem.description}</p>
                </div>

                {/* Sample Test Cases */}
                {activeProblem.sampleTestCases?.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h3 style={{ color: "#ffed4e", fontFamily: "'Courier New', monospace", fontWeight: "bold", fontSize: "0.85rem" }}>SAMPLE TEST CASES</h3>
                    {activeProblem.sampleTestCases.map((tc: any, i: number) => (
                      <div key={i} className="rounded-lg p-3 text-xs" style={{ background: "rgba(40,40,40,0.8)", border: "1px solid #444" }}>
                        <button onClick={() => setExpandedTests((prev) => ({ ...prev, [i]: !prev[i] }))} className="flex items-center gap-1 w-full text-left text-gray-300">
                          {expandedTests[i] ? <ChevronDown size={12} /> : <ChevronRight size={12} />} Test {i + 1}
                        </button>
                        {expandedTests[i] && (
                          <div className="mt-2 space-y-1">
                            <div><span className="text-gray-500">Input:</span><pre className="text-gray-300 mt-0.5">{tc.inputData}</pre></div>
                            <div><span className="text-gray-500">Expected:</span><pre className="text-green-300 mt-0.5">{tc.expectedOutput}</pre></div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Run Results */}
                {runResults && (
                  <div className="mt-4 rounded-lg p-3" style={{ background: "rgba(40,40,40,0.8)", border: `1px solid ${runResults.allPassed ? "#22c55e" : "#ef4444"}` }}>
                    <div className="flex items-center gap-2 mb-2">
                      {runResults.allPassed ? <CheckCircle size={16} className="text-green-400" /> : <XCircle size={16} className="text-red-400" />}
                      <span className="text-sm font-bold text-white">{runResults.passedCount}/{runResults.totalCount} passed</span>
                    </div>
                    {runResults.results?.map((r: any, i: number) => (
                      <div key={i} className={`text-xs p-2 rounded mt-1 ${r.passed ? "bg-green-900/30" : "bg-red-900/30"}`}>
                        <span className={r.passed ? "text-green-400" : "text-red-400"}>Test {i + 1}: {r.passed ? "PASS" : "FAIL"}</span>
                        {!r.passed && r.actualOutput && <div className="text-gray-400 mt-1">Got: {r.actualOutput}</div>}
                        {r.error && <div className="text-red-300 mt-1">{r.error}</div>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p style={{ color: "#999", fontFamily: "'Courier New', monospace" }}>Loading problems...</p>
            )}
          </div>

          {/* Editor */}
          <div className="flex-1">
            <MonacoEditor
              height="100%"
              language={language}
              value={code}
              onChange={(val) => setCode(val || "")}
              theme="vs-dark"
              options={{ fontSize: 14, minimap: { enabled: false }, scrollBeyondLastLine: false, padding: { top: 10 } }}
            />
          </div>
        </div>

        {/* Modals */}
        <ResultsModal isOpen={showResults} onClose={() => setShowResults(false)} results={results} onSubmitAgain={() => setShowResults(false)} />
        <ConfirmationDialog isOpen={showConfirm} onClose={() => setShowConfirm(false)} onConfirm={handleLeaveConfirm}
          score={currentScore} problemsCompleted={problemsCompleted} totalProblems={problems.length} timeRemaining={timeLeft * 1000} />
        {showChat && <MatchChatPanel matchId={matchId} isOpen={showChat} onToggle={() => setShowChat(!showChat)} currentUserEmail={user?.email || ""} />}
      </div>
    </ProtectedRoute>
  );
}