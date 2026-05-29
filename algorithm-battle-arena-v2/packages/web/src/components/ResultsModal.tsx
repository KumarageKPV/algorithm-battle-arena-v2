"use client";
import { X, CheckCircle, XCircle, Clock } from "lucide-react";

interface TestResult { passed: boolean; input: string; expectedOutput: string; actualOutput: string; executionTime: number; error?: string | null; timedOut?: boolean; }
interface Props { isOpen: boolean; onClose: () => void; results: { score: number; passedCount: number; totalCount: number; results: TestResult[]; error?: string } | null; onSubmitAgain?: () => void; }

export default function ResultsModal({ isOpen, onClose, results, onSubmitAgain }: Props) {
  if (!isOpen || !results) return null;
  const { score, passedCount, totalCount, results: testResults, error } = results;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="rounded-2xl shadow-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto" style={{ background: "rgba(20,20,20,0.95)", border: "2px solid #ff6b00" }}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold" style={{ color: "#ffed4e", fontFamily: "'MK4', Impact, sans-serif" }}>Submission Results</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="h-6 w-6" /></button>
        </div>

        {error ? (
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-4"><p className="text-red-200">Error: {error}</p></div>
        ) : (
          <>
            <div className="rounded-lg p-4 mb-6" style={{ background: "rgba(40,40,40,0.8)" }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-semibold text-white">Overall Score</span>
                <span className={`text-2xl font-bold ${score >= 70 ? "text-green-400" : score >= 40 ? "text-yellow-400" : "text-red-400"}`}>{score}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div className={`h-3 rounded-full transition-all duration-500 ${score >= 70 ? "bg-green-500" : score >= 40 ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${score}%` }} />
              </div>
              <p className="text-gray-300 mt-2">{passedCount} of {totalCount} test cases passed</p>
            </div>

            <div className="space-y-3 mb-6">
              <h3 className="text-lg font-semibold text-white">Test Cases</h3>
              {testResults?.map((r, i) => (
                <div key={i} className={`border rounded-lg p-3 ${r.passed ? "border-green-500 bg-green-900/20" : "border-red-500 bg-red-900/20"}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {r.passed ? <CheckCircle className="h-5 w-5 text-green-400" /> : <XCircle className="h-5 w-5 text-red-400" />}
                      <span className="text-white font-medium">Test Case {i + 1}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-400 text-xs"><Clock size={12} />{r.executionTime}ms</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><span className="text-gray-400">Input:</span><pre className="text-gray-300 mt-1 bg-black/30 p-2 rounded overflow-x-auto">{r.input || "(none)"}</pre></div>
                    <div><span className="text-gray-400">Expected:</span><pre className="text-green-300 mt-1 bg-black/30 p-2 rounded overflow-x-auto">{r.expectedOutput}</pre></div>
                  </div>
                  {!r.passed && (
                    <div className="mt-2 text-xs"><span className="text-gray-400">Got:</span><pre className="text-red-300 mt-1 bg-black/30 p-2 rounded overflow-x-auto">{r.error || r.actualOutput || "(no output)"}</pre></div>
                  )}
                </div>
              ))}
            </div>

            {onSubmitAgain && (
              <div className="flex justify-end">
                <button onClick={onSubmitAgain} className="px-6 py-2 bg-arena-orange text-black font-bold rounded-lg hover:bg-orange-600">Try Again</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

