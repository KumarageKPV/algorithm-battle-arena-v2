"use client";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import ResultsModal from "@/components/ResultsModal";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import MatchChatPanel from "@/components/chat/MatchChatPanel";
import MicroCourseModal from "@/components/MicroCourseModal";
import { codeExecutionApi, matchesApi, submissionsApi, problemsApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import dynamic from "next/dynamic";
import { Clock, Send, LogOut, Play, ChevronDown, ChevronRight, CheckCircle, XCircle, MessageCircle, HelpCircle } from "lucide-react";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

export default function MatchPage() {
  const params = useParams();
  const matchId = params?.matchId as string;
  const { user } = useAuth();
  const router = useRouter();

  const [code, setCode] = useState("# Write your solution here\n");
  const [language, setLanguage] = useState("python");
  const [timeLeft, setTimeLeft] = useState(600);
  const [problems, setProblems] = useState<any[]>([]);
  const [activeProblemIdx, setActiveProblemIdx] = useState(0);
  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showMicroCourse, setShowMicroCourse] = useState(false);
  const [microCourseData, setMicroCourseData] = useState<any>(null);
  const [isMicroCourseLoading, setIsMicroCourseLoading] = useState(false);
  const [runResults, setRunResults] = useState<any>(null);
  const [currentScore, setCurrentScore] = useState(0);
  const [problemsCompleted, setProblemsCompleted] = useState(0);
  const [expandedTests, setExpandedTests] = useState<Record<number, boolean>>({});
  const [submittedProblemIds, setSubmittedProblemIds] = useState<Set<number>>(new Set());
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const timerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => { if (prev <= 0) { clearInterval(timerRef.current); return 0; } return prev - 1; });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  // Load only the problems selected for this match.
  useEffect(() => {
    if (!matchId) return;
    const id = parseInt(matchId, 10);
    Promise.all([
      matchesApi.getProblems(id),
      submissionsApi.getUserSubmissions(id),
    ]).then(([problemRes, submissionRes]) => {
      setProblems(Array.isArray(problemRes.data) ? problemRes.data : []);
      const submitted = new Set<number>(
        (Array.isArray(submissionRes.data) ? submissionRes.data : []).map((s: any) => s.problemId),
      );
      setSubmittedProblemIds(submitted);
      setProblemsCompleted(submitted.size);
      setCurrentScore(
        (Array.isArray(submissionRes.data) ? submissionRes.data : []).reduce((max: number, s: any) => Math.max(max, s.score ?? 0), 0),
      );
    }).catch(() => {});
  }, [matchId]);

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const activeProblem = problems[activeProblemIdx];
  const activeTestCases = (activeProblem?.testCases ?? []).map((tc: any) => ({
    inputData: tc.inputData ?? "",
    expectedOutput: tc.expectedOutput ?? "",
  }));
  const hasSubmittedActive = activeProblem ? submittedProblemIds.has(activeProblem.problemId) : false;
  const editorLanguage = language === "c++" ? "cpp" : language;

  const normalizeRunResult = (data: any) => ({
    ...data,
    results: (data.results ?? data.testCaseResults ?? []).map((r: any, i: number) => ({
      ...r,
      input: r.input ?? activeTestCases[i]?.inputData ?? "",
      expectedOutput: r.expectedOutput ?? activeTestCases[i]?.expectedOutput ?? "",
      actualOutput: r.actualOutput ?? "",
      executionTime: r.executionTime ?? 0,
    })),
  });

  const handleRun = async () => {
    if (!activeProblem) { alert("No problem selected"); return; }
    if (activeTestCases.length === 0) { alert("No test cases available"); return; }
    setIsRunning(true);
    try {
      const result = await codeExecutionApi.runTests({ code, language, testCases: activeTestCases });
      setRunResults(normalizeRunResult(result.data));
    } catch (err: any) {
      alert(err?.response?.data?.message || "Run failed");
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!activeProblem) { alert("No problem selected"); return; }
    if (hasSubmittedActive) { alert("You have already submitted this problem."); return; }
    setIsSubmitting(true);
    try {
      const res = await submissionsApi.create({
        matchId: parseInt(matchId), problemId: activeProblem.problemId, language, code, status: "Submitted",
      });
      const normalized = normalizeRunResult(res.data);
      setResults(normalized);
      setShowResults(true);
      setSubmittedProblemIds((prev) => new Set(prev).add(activeProblem.problemId));
      setProblemsCompleted((p) => p + 1);
      setCurrentScore((s) => Math.max(s, normalized?.score || 0));
    } catch (err: any) {
      alert(err?.response?.data?.message || "Submit failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLeaveConfirm = () => { setShowConfirm(false); router.push("/lobby"); };

  const handleGetHelp = async () => {
    if (!activeProblem) { alert("No problem selected"); return; }
    setShowMicroCourse(true);
    setIsMicroCourseLoading(true);
    setMicroCourseData(null);
    try {
      const res = await problemsApi.getMicroCourse(activeProblem.problemId, {
        language,
        timeLimitSeconds: 600,
        remainingSec: timeLeft,
      });
      setMicroCourseData(res.data);
    } catch (err: any) {
      console.error("Failed to load micro-course:", err);
      setMicroCourseData(null);
    } finally {
      setIsMicroCourseLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex h-screen flex-col bg-[var(--surface)] text-foreground">
        {/* Toolbar */}
        <div className="flex items-center justify-between border-b border-border bg-white px-4 py-2 shadow-[0_1px_2px_rgba(30,27,26,0.04)]">
          <div>
            <div className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground">LIVE MATCH</div>
            <h1 className="font-display text-lg font-semibold">Match #{matchId}</h1>
          </div>
          <div className="flex items-center gap-2">
            <select value={language} onChange={(e) => setLanguage(e.target.value)}
              className="h-8 rounded-md border border-input bg-input-background px-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30">
              <option value="python">Python 3.8</option><option value="java">Java</option><option value="c++">C++</option><option value="c">C</option>
            </select>
            <div className={`flex items-center gap-1 rounded-md border border-border bg-muted/40 px-2 py-1 font-mono text-sm tabular-nums ${timeLeft < 60 ? "text-[var(--tension)] animate-pulse" : "text-foreground"}`}>
              <Clock size={16} /> {fmt(timeLeft)}
            </div>
            <button onClick={handleRun} disabled={isRunning || !activeProblem} className="flex items-center gap-1 rounded-md border border-success/30 bg-white px-3 py-1.5 text-sm font-medium text-success hover:bg-success/10 disabled:opacity-50">
              <Play size={14} /> {isRunning ? "Running" : "Run"}
            </button>
            <button onClick={handleSubmit} disabled={isSubmitting || !activeProblem || hasSubmittedActive} className={`flex items-center gap-1 rounded-md px-4 py-1.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50 ${hasSubmittedActive ? "border border-border bg-muted text-muted-foreground" : "bg-primary text-primary-foreground hover:bg-[#C62828]"}`}>
              <Send size={14} /> {hasSubmittedActive ? "Submitted" : isSubmitting ? "Submitting" : "Submit"}
            </button>
            <button onClick={handleGetHelp} disabled={!activeProblem} className="flex items-center gap-1 rounded-md border border-[var(--warning)]/30 bg-[var(--warning)]/10 px-3 py-1.5 text-sm font-medium text-[#7A5A00] hover:bg-[var(--warning)]/20 disabled:opacity-50">
              <HelpCircle size={14} /> AI Help
            </button>
            <button onClick={() => setShowChat(!showChat)} className="flex items-center gap-1 rounded-md border border-border bg-white px-3 py-1.5 text-sm hover:bg-muted">
              <MessageCircle size={14} />
            </button>
            <button onClick={() => setShowConfirm(true)} className="flex items-center gap-1 rounded-md border border-destructive/30 bg-white px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10">
              <LogOut size={14} /> Exit
            </button>
          </div>
        </div>

        {/* Main Area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Problem Panel */}
          <div className="w-96 overflow-y-auto border-r border-border bg-white p-4">
            {problems.length > 1 && (
              <div className="flex gap-1 mb-4 flex-wrap">
                {problems.map((p, i) => (
                  <button key={p.problemId} onClick={() => { setActiveProblemIdx(i); setRunResults(null); }}
                    className={`rounded-md border px-3 py-1 text-xs font-medium ${i === activeProblemIdx ? "border-primary bg-primary text-primary-foreground" : "border-border bg-white text-muted-foreground hover:bg-muted"}`}>
                    P{i + 1}{submittedProblemIds.has(p.problemId) ? " ✓" : ""}
                  </button>
                ))}
              </div>
            )}

            {activeProblem ? (
              <div>
                <h2 className="mb-2 font-display text-lg font-semibold">{activeProblem.title}</h2>
                <span className={`mb-3 inline-block rounded border px-2 py-0.5 font-mono text-[10px] ${activeProblem.difficultyLevel === "Easy" ? "border-success/20 bg-success/10 text-success" : activeProblem.difficultyLevel === "Hard" ? "border-destructive/20 bg-destructive/10 text-destructive" : "border-[var(--warning)]/30 bg-[var(--warning)]/15 text-[#7A5A00]"}`}>
                  {activeProblem.difficultyLevel}
                </span>
                <div className="mt-3 rounded-lg border border-border bg-muted/30 p-3 text-sm text-foreground/80">
                  <p className="whitespace-pre-wrap leading-relaxed">{activeProblem.description}</p>
                </div>

                {/* Test Cases */}
                {activeTestCases.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h3 className="font-mono text-[10px] font-semibold tracking-[0.2em] text-muted-foreground">TEST CASES</h3>
                    {activeTestCases.map((tc: any, i: number) => (
                      <div key={i} className="rounded-lg border border-border bg-white p-3 text-xs shadow-[0_1px_2px_rgba(30,27,26,0.04)]">
                        <button onClick={() => setExpandedTests((prev) => ({ ...prev, [i]: !prev[i] }))} className="flex w-full items-center gap-1 text-left font-medium text-foreground">
                          {expandedTests[i] ? <ChevronDown size={12} /> : <ChevronRight size={12} />} Test {i + 1}
                        </button>
                        {expandedTests[i] && (
                          <div className="mt-2 space-y-1">
                            <div><span className="text-muted-foreground">Input:</span><pre className="mt-0.5 overflow-x-auto rounded bg-muted p-2 text-foreground">{tc.inputData}</pre></div>
                            <div><span className="text-muted-foreground">Expected:</span><pre className="mt-0.5 overflow-x-auto rounded bg-success/10 p-2 text-success">{tc.expectedOutput}</pre></div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Run Results */}
                {runResults && (
                  <div className={`mt-4 rounded-lg border p-3 ${runResults.allPassed ? "border-success/30 bg-success/5" : "border-destructive/30 bg-destructive/5"}`}>
                    <div className="flex items-center gap-2 mb-2">
                      {runResults.allPassed ? <CheckCircle size={16} className="text-success" /> : <XCircle size={16} className="text-destructive" />}
                      <span className="text-sm font-semibold">{runResults.passedCount}/{runResults.totalCount} passed</span>
                    </div>
                    {runResults.results?.map((r: any, i: number) => (
                      <div key={i} className={`mt-1 rounded border p-2 text-xs ${r.passed ? "border-success/20 bg-white" : "border-destructive/20 bg-white"}`}>
                        <span className={r.passed ? "text-success" : "text-destructive"}>Test {i + 1}: {r.passed ? "PASS" : "FAIL"}</span>
                        {!r.passed && r.actualOutput && <div className="mt-1 text-muted-foreground">Got: {r.actualOutput}</div>}
                        {r.error && <div className="mt-1 text-destructive">{r.error}</div>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Loading problems...</p>
            )}
          </div>

          {/* Editor */}
          <div className="min-w-0 flex-1 bg-white">
            <MonacoEditor
              height="100%"
              language={editorLanguage}
              value={code}
              onChange={(val) => setCode(val || "")}
              theme="light"
              options={{ fontSize: 14, minimap: { enabled: false }, scrollBeyondLastLine: false, padding: { top: 10 } }}
            />
          </div>
        </div>

        {/* Modals */}
        <ResultsModal isOpen={showResults} onClose={() => setShowResults(false)} results={results} onSubmitAgain={() => setShowResults(false)} />
        <ConfirmationDialog isOpen={showConfirm} onClose={() => setShowConfirm(false)} onConfirm={handleLeaveConfirm}
          score={currentScore} problemsCompleted={problemsCompleted} totalProblems={problems.length} timeRemaining={timeLeft * 1000} />
        <MicroCourseModal isOpen={showMicroCourse} onClose={() => setShowMicroCourse(false)} courseData={microCourseData} isLoading={isMicroCourseLoading} />
        {showChat && <MatchChatPanel matchId={matchId} isOpen={showChat} onToggle={() => setShowChat(!showChat)} currentUserEmail={user?.email || ""} />}
      </div>
    </ProtectedRoute>
  );
}
