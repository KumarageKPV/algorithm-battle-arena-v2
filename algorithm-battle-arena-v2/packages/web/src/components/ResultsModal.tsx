"use client";
import { X, CheckCircle, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TestResult { passed: boolean; input: string; expectedOutput: string; actualOutput: string; executionTime: number; error?: string | null; timedOut?: boolean; }
interface Props { isOpen: boolean; onClose: () => void; results: { score: number; passedCount: number; totalCount: number; results: TestResult[]; error?: string } | null; onSubmitAgain?: () => void; }

export default function ResultsModal({ isOpen, onClose, results, onSubmitAgain }: Props) {
  if (!isOpen || !results) return null;
  const { score, passedCount, totalCount, results: testResults, error } = results;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/45 p-4 backdrop-blur-sm">
      <div className="max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-border bg-white shadow-[0_24px_80px_-35px_rgba(30,27,26,0.45)]">
        <div className="flex items-center justify-between border-b border-border p-4">
          <div>
            <div className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground">EXECUTION</div>
            <h2 className="font-display text-xl font-semibold">Submission results</h2>
          </div>
          <button onClick={onClose} className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"><X className="h-5 w-5" /></button>
        </div>

        <div className="p-5">
          {error ? (
          <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 p-4"><p className="text-destructive">Error: {error}</p></div>
        ) : (
          <>
            <div className="mb-6 rounded-lg border border-border bg-muted/30 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-display text-lg font-semibold">Overall Score</span>
                <span className={`font-display text-2xl font-bold ${score >= 70 ? "text-success" : score >= 40 ? "text-[#7A5A00]" : "text-destructive"}`}>{score}%</span>
              </div>
              <div className="h-3 w-full rounded-full bg-muted">
                <div className={`h-3 rounded-full transition-all duration-500 ${score >= 70 ? "bg-success" : score >= 40 ? "bg-[#F6C445]" : "bg-destructive"}`} style={{ width: `${score}%` }} />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{passedCount} of {totalCount} test cases passed</p>
            </div>

            <div className="space-y-3 mb-6">
              <h3 className="font-display text-lg font-semibold">Test Cases</h3>
              {testResults?.map((r, i) => (
                <div key={i} className={`rounded-lg border p-3 ${r.passed ? "border-success/30 bg-success/5" : "border-destructive/30 bg-destructive/5"}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {r.passed ? <CheckCircle className="h-5 w-5 text-success" /> : <XCircle className="h-5 w-5 text-destructive" />}
                      <span className="font-medium">Test Case {i + 1}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground"><Clock size={12} />{r.executionTime}ms</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><span className="text-muted-foreground">Input:</span><pre className="mt-1 overflow-x-auto rounded bg-white p-2 text-foreground">{r.input || "(none)"}</pre></div>
                    <div><span className="text-muted-foreground">Expected:</span><pre className="mt-1 overflow-x-auto rounded bg-success/10 p-2 text-success">{r.expectedOutput}</pre></div>
                  </div>
                  {!r.passed && (
                    <div className="mt-2 text-xs"><span className="text-muted-foreground">Got:</span><pre className="mt-1 overflow-x-auto rounded bg-white p-2 text-destructive">{r.error || r.actualOutput || "(no output)"}</pre></div>
                  )}
                </div>
              ))}
            </div>

            {onSubmitAgain && (
              <div className="flex justify-end">
                <Button onClick={onSubmitAgain} className="bg-primary hover:bg-[#C62828]">Close</Button>
              </div>
            )}
          </>
        )}
        </div>
      </div>
    </div>
  );
}
