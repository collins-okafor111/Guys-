import React, { useState } from "react";
import { CheckCircle2, XCircle, Play, RefreshCw, X, ShieldCheck, Zap } from "lucide-react";
import { useConvex, TestResult } from "../../context/ConvexContext";

interface TestRunnerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TestRunnerModal: React.FC<TestRunnerModalProps> = ({ isOpen, onClose }) => {
  const { runTestSuite } = useConvex();
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  if (!isOpen) return null;

  const handleRun = async () => {
    setIsRunning(true);
    try {
      const res = await runTestSuite();
      setResults(res);
    } finally {
      setIsRunning(false);
    }
  };

  const totalPassed = results.filter((r) => r.passed).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#0d101d] rounded-3xl shadow-2xl border border-purple-500/30 overflow-hidden max-h-[90vh] flex flex-col text-slate-100">
        {/* Header */}
        <div className="p-6 border-b border-purple-900/30 flex items-center justify-between bg-[#0a0c16]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#14182e] border border-purple-900/40 flex items-center justify-center text-purple-400 font-bold">
              <Zap className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                Marketplace Verification Test Suite
              </h3>
              <p className="text-xs text-slate-400">
                Automated tests verifying multi-account isolation and data security
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-[#15192e] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="flex items-center justify-between p-4 bg-[#0a0c16] rounded-2xl border border-purple-900/30">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase">Test Suite Status</p>
              <p className="text-sm font-bold text-white mt-0.5">
                {results.length === 0
                  ? "Ready to execute 14 acceptance tests"
                  : `${totalPassed} / ${results.length} Tests Passed (${((totalPassed / results.length) * 100).toFixed(0)}%)`}
              </p>
            </div>
            <button
              onClick={handleRun}
              disabled={isRunning}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow-md shadow-purple-900/40 disabled:opacity-50 transition-all active:scale-95"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Running Tests...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  Run All Tests
                </>
              )}
            </button>
          </div>

          {/* Test Results List */}
          <div className="space-y-2.5">
            {results.map((test) => (
              <div
                key={test.id}
                className={`p-3.5 rounded-2xl border transition-colors ${
                  test.passed
                    ? "bg-emerald-950/40 border-emerald-800/40 text-emerald-200"
                    : "bg-rose-950/40 border-rose-800/40 text-rose-200"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    {test.passed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <h4 className="text-xs font-bold text-white">{test.title}</h4>
                      <p className="text-xs text-slate-300 mt-0.5">{test.expected}</p>
                      <p className="text-[11px] font-mono mt-1 text-purple-300 bg-[#090b14] px-2 py-1 rounded inline-block border border-purple-900/40">
                        {test.details}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      test.passed ? "bg-emerald-900/60 text-emerald-300 border border-emerald-700/40" : "bg-rose-900/60 text-rose-300 border border-rose-700/40"
                    }`}
                  >
                    {test.passed ? "PASSED" : "FAILED"}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {results.length === 0 && (
            <div className="text-center py-8 px-4 border-2 border-dashed border-purple-900/30 rounded-2xl bg-[#0a0c16]">
              <ShieldCheck className="w-12 h-12 text-slate-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-white">Verification tests not yet run</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Click "Run All Tests" above to verify store creation, product publication, follow isolation between accounts, order segregation, and messaging authorization.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-purple-900/30 bg-[#0a0c16] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-[#15192e] border border-purple-900/40 rounded-xl"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
