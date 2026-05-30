import { useState } from "react";
import { HelpCircle, BrainCircuit, Play, CheckCircle2, RotateCw, Sparkles } from "lucide-react";
import { SolverResult } from "../types";

interface ProblemSolverProps {
  onLogProgress: (category: string, activityName: string) => void;
}

export default function ProblemSolver({ onLogProgress }: ProblemSolverProps) {
  const [problemText, setProblemText] = useState("");
  const [topicSelection, setTopicSelection] = useState("algebra");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SolverResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSolve = async () => {
    if (!problemText.trim()) {
      setErrorMsg("Please write or paste a mathematics problem first.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setResult(null);

    try {
      const response = await fetch("/api/tutor/solve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problem: problemText, topic: topicSelection }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Tutor server was busy. Please try again.");
      }

      const parsedResult: SolverResult = await response.json();
      setResult(parsedResult);
      
      // Auto save the progress log
      onLogProgress(topicSelection, `Solved problem: "${problemText.slice(0, 30)}..."`);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "An unexpected issue occurred while requesting the math solver.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden" id="step-problem-solver-frame">
      {/* Header */}
      <div className="bg-slate-50 border-b border-slate-100 p-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-indigo-600" />
            AI Step-by-Step Problem Solver
          </h2>
          <p className="text-xs text-slate-500">
            Submit complex algebraic equations, trigonometry derivations, or arithmetic word problems for rigorous, step-by-step guidance.
          </p>
        </div>
        <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Instructions and Inputs */}
          <div className="md:col-span-1 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mathematical Discipline</label>
              <select
                value={topicSelection}
                onChange={(e) => setTopicSelection(e.target.value)}
                className="w-full border rounded-xl p-2.5 text-sm bg-white text-slate-700 outline-none focus:border-indigo-500 transition-colors border-slate-200"
              >
                <option value="arithmetic">Basic Arithmetic & Fractions</option>
                <option value="algebra">Algebra & Equations</option>
                <option value="geometry">Geometry & Trigonometry</option>
                <option value="calculus">Calculus & Math Physics</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Your Problem Expression</label>
              <textarea
                value={problemText}
                onChange={(e) => setProblemText(e.target.value)}
                rows={5}
                placeholder="Examples: 
- Factor x^2 - 7x + 12
- If sin(θ) = 3/5, find cos(2θ)
- Solve for x: 3x + 15 = 2x + 24"
                className="w-full border rounded-xl p-3 text-sm text-slate-700 outline-none focus:border-indigo-500 font-mono transition-colors border-slate-200"
              ></textarea>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 text-red-700 border border-red-100 rounded-xl text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            <button
              onClick={handleSolve}
              disabled={loading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer text-sm disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" /> Analyzing Math Matrix...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" /> Execute Smart Solver
                </>
              )}
            </button>
          </div>

          {/* Detailed Step Results display */}
          <div className="md:col-span-2 bg-slate-50 rounded-2xl border border-slate-100 p-6 min-h-[250px] flex flex-col justify-between">
            {loading && (
              <div className="flex flex-col items-center justify-center h-full space-y-3 py-12" id="solver-loading">
                <BrainCircuit className="w-12 h-12 text-indigo-500 animate-spin" />
                <span className="text-sm font-semibold text-slate-600">Formulating algebraic rules...</span>
                <span className="text-[10px] text-slate-400">Querying Google Gemini for absolute precision</span>
              </div>
            )}

            {!loading && !result && (
              <div className="flex flex-col items-center justify-center h-full text-center py-12 text-slate-400" id="solver-fallback">
                <HelpCircle className="w-12 h-12 mb-3 stroke-1 text-slate-300" />
                <span className="text-sm font-semibold text-slate-600">Ready to break down operations</span>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  Write any complex expression on the left and select its discipline to observe complete step-by-step solutions.
                </p>
              </div>
            )}

            {result && (
              <div id="solver-results-box" className="space-y-6">
                {/* Solved Title */}
                <div className="flex flex-wrap items-center justify-between border-b border-slate-200/60 pb-3 gap-2">
                  <div>
                    <span className="text-xs uppercase font-extrabold text-indigo-600 tracking-wider">Solution Map</span>
                    <h3 className="text-lg font-bold text-slate-800">{result.topic} Solve</h3>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full text-emerald-800 text-xs font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Gemini Confidence: {result.confidenceLevel}</span>
                  </div>
                </div>

                {/* Steps Timeline */}
                <div className="space-y-4">
                  {result.steps.map((step, idx) => (
                    <div key={idx} className="flex gap-4" id={`solver-step-${idx}`}>
                      <div className="flex flex-col items-center">
                        <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-mono font-bold text-xs">
                          {idx + 1}
                        </div>
                        {idx < result.steps.length - 1 && (
                          <div className="w-0.5 bg-indigo-100 flex-1 my-2"></div>
                        )}
                      </div>
                      <div className="space-y-1.5 flex-1 pt-0.5">
                        <h4 className="text-sm font-bold text-slate-800 font-sans">{step.title}</h4>
                        <p className="text-xs text-slate-600 leading-relaxed font-sans">{step.explanation}</p>
                        <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg">
                          <code className="text-emerald-400 font-mono text-xs md:text-sm block">{step.equation}</code>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Final Answer Banner */}
                <div className="bg-emerald-500 text-white rounded-xl p-4 mt-6">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-100 block">Ultimate Factored Outcome</span>
                  <div className="text-xl md:text-2xl font-mono font-bold mt-1 tracking-tight">
                    {result.finalAnswer}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
