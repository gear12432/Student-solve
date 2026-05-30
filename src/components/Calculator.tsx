import { useState } from "react";
import { Percent, Percent as Fractions, RotateCcw, HelpCircle, Activity, Equal, ShieldQuestion, Check } from "lucide-react";

export default function Calculator() {
  const [calcTab, setCalcTab] = useState<"scientific" | "fractions" | "percentages">("scientific");
  
  // Scientific Calculator State
  const [display, setDisplay] = useState("");
  const [historyLine, setHistoryLine] = useState("");

  // Fractions State
  const [numA, setNumA] = useState(2);
  const [denA, setDenA] = useState(3);
  const [numB, setNumB] = useState(3);
  const [denB, setDenB] = useState(4);
  const [fractionOp, setFractionOp] = useState<"+" | "-" | "*" | "/">("+");
  const [fractionResult, setFractionResult] = useState<{ num: number; den: number; approx: number } | null>(null);

  // Percentages State
  const [percentX, setPercentX] = useState(15);
  const [percentY, setPercentY] = useState(250);
  const [percentResult, setPercentResult] = useState<number | null>(null);

  // Math helper function - Greatest Common Divisor
  function computeGcd(a: number, b: number): number {
    return b === 0 ? Math.abs(a) : computeGcd(b, a % b);
  }

  // Evaluate Scientific Expression safely in browser
  const handleScientificEval = () => {
    try {
      // Replace symbols for evaluation
      let sanitizedExp = display
        .replace(/π/g, "Math.PI")
        .replace(/sin\(/g, "Math.sin(")
        .replace(/cos\(/g, "Math.cos(")
        .replace(/tan\(/g, "Math.tan(")
        .replace(/log\(/g, "Math.log10(")
        .replace(/ln\(/g, "Math.log(")
        .replace(/√\(/g, "Math.sqrt(")
        .replace(/\^/g, "**");

      // Count parenthesizes to auto-close if missing
      const opened = (sanitizedExp.match(/\(/g) || []).length;
      const closed = (sanitizedExp.match(/\)/g) || []).length;
      if (opened > closed) {
        sanitizedExp += ")".repeat(opened - closed);
      }

      // Safe evaluation
      const result = new Function(`return ${sanitizedExp}`)();
      if (Number.isNaN(result) || !Number.isFinite(result)) {
        throw new Error("Invalid output");
      }
      setHistoryLine(`${display} =`);
      setDisplay(String(Number(result).toLocaleString("en-US", { maximumFractionDigits: 6 })));
    } catch (err) {
      setDisplay("Error");
    }
  };

  // Perform fraction calculation
  const solveFraction = () => {
    let finalNum = 0;
    let finalDen = 1;

    if (denA === 0 || denB === 0) {
      alert("Denominator cannot be 0");
      return;
    }

    switch (fractionOp) {
      case "+":
        finalNum = numA * denB + numB * denA;
        finalDen = denA * denB;
        break;
      case "-":
        finalNum = numA * denB - numB * denA;
        finalDen = denA * denB;
        break;
      case "*":
        finalNum = numA * numB;
        finalDen = denA * denB;
        break;
      case "/":
        finalNum = numA * denB;
        finalDen = denA * numB;
        break;
    }

    if (finalDen === 0) {
      alert("Divide by zero error");
      return;
    }

    const commonDivisor = computeGcd(finalNum, finalDen);
    const reducedNum = finalNum / commonDivisor;
    const reducedDen = finalDen / commonDivisor;

    setFractionResult({
      num: reducedNum,
      den: reducedDen,
      approx: finalNum / finalDen,
    });
  };

  // Perform percentage calculation
  const solvePercentage = () => {
    const val = (percentX / 100) * percentY;
    setPercentResult(val);
  };

  // Calc Keypress Handler
  const pressKey = (key: string) => {
    if (display === "Error") {
      setDisplay(key);
      return;
    }
    setDisplay((prev) => prev + key);
  };

  const handleBackspace = () => {
    setDisplay((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setDisplay("");
    setHistoryLine("");
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden" id="math-calculators-frame">
      {/* Switcher Navigation */}
      <div className="bg-slate-50 border-b border-slate-100 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-600" />
            Core Mathematical Utilities
          </h3>
          <p className="text-xs text-slate-500">
            A native tool belt featuring scientific functions, fractional simplifiers, and percentage variables calculators.
          </p>
        </div>
        <div className="flex gap-1.5 p-1 bg-slate-200/60 rounded-xl max-w-fit">
          {[
            { id: "scientific", label: "Scientific Engine" },
            { id: "fractions", label: "Fractions Solver" },
            { id: "percentages", label: "Percentages Mod" },
          ].map((itm) => (
            <button
              key={itm.id}
              onClick={() => setCalcTab(itm.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                calcTab === itm.id
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {itm.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {/* VIEW 1: Scientific Calculator */}
        {calcTab === "scientific" && (
          <div className="max-w-md mx-auto bg-slate-950 p-5 rounded-3xl shadow-xl border border-slate-900" id="sci-calc-shell">
            {/* Display */}
            <div className="text-right mb-4 bg-slate-900/40 p-4 rounded-2xl border border-slate-900/60 h-24 flex flex-col justify-end">
              <span className="text-xs text-slate-500 font-mono tracking-wider min-h-[16px] block">{historyLine}</span>
              <span id="calc-display text" className="text-2xl md:text-3xl text-emerald-400 font-mono font-bold block truncate mt-1">
                {display || "0"}
              </span>
            </div>

            {/* Scientific Buttons Layout */}
            <div className="grid grid-cols-5 gap-2">
              {/* Scientific Functions */}
              <button onClick={() => pressKey("sin(")} className="btn-calc font-sans">sin</button>
              <button onClick={() => pressKey("cos(")} className="btn-calc font-sans">cos</button>
              <button onClick={() => pressKey("tan(")} className="btn-calc font-sans">tan</button>
              <button onClick={() => pressKey("√(")} className="btn-calc font-sans">√</button>
              <button onClick={() => pressKey("π")} className="btn-calc font-sans text-amber-500 font-bold">π</button>

              <button onClick={() => pressKey("ln(")} className="btn-calc font-sans">ln</button>
              <button onClick={() => pressKey("log(")} className="btn-calc font-sans">log</button>
              <button onClick={() => pressKey("^")} className="btn-calc font-sans">x^y</button>
              <button onClick={() => pressKey("(")} className="btn-calc font-sans text-indigo-400 font-bold">(</button>
              <button onClick={() => pressKey(")")} className="btn-calc font-sans text-indigo-400 font-bold">)</button>

              {/* Numbers and Common operators */}
              <button onClick={() => pressKey("7")} className="btn-calc-num">7</button>
              <button onClick={() => pressKey("8")} className="btn-calc-num">8</button>
              <button onClick={() => pressKey("9")} className="btn-calc-num">9</button>
              <button onClick={handleBackspace} className="btn-calc text-orange-500 font-bold font-sans">DEL</button>
              <button onClick={handleClear} className="btn-calc text-red-500 font-bold font-sans">AC</button>

              <button onClick={() => pressKey("4")} className="btn-calc-num">4</button>
              <button onClick={() => pressKey("5")} className="btn-calc-num">5</button>
              <button onClick={() => pressKey("6")} className="btn-calc-num">6</button>
              <button onClick={() => pressKey("*")} className="btn-calc text-indigo-400 font-bold font-sans">&times;</button>
              <button onClick={() => pressKey("/")} className="btn-calc text-indigo-400 font-bold font-sans">&divide;</button>

              <button onClick={() => pressKey("1")} className="btn-calc-num">1</button>
              <button onClick={() => pressKey("2")} className="btn-calc-num">2</button>
              <button onClick={() => pressKey("3")} className="btn-calc-num">3</button>
              <button onClick={() => pressKey("+")} className="btn-calc text-indigo-400 font-bold font-sans">+</button>
              <button onClick={() => pressKey("-")} className="btn-calc text-indigo-400 font-bold font-sans">-</button>

              <button onClick={() => pressKey("0")} className="btn-calc-num col-span-2">0</button>
              <button onClick={() => pressKey(".")} className="btn-calc-num">.</button>
              <button onClick={handleScientificEval} className="btn-calc col-span-2 bg-indigo-600 font-bold text-white hover:bg-indigo-500 border-none inline-flex items-center justify-center gap-1">
                <Equal className="w-4 h-4" /> Evaluate
              </button>
            </div>
          </div>
        )}

        {/* VIEW 2: Fractions Solver */}
        {calcTab === "fractions" && (
          <div className="max-w-xl mx-auto" id="fraction-calculator-panel">
            <h4 className="text-sm font-bold text-slate-700 mb-4 text-center">Compute & Simplify Fraction Expressions</h4>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
              {/* Fraction A */}
              <div className="flex flex-col items-center gap-2">
                <span className="text-xs text-slate-400 uppercase font-extrabold tracking-wider">Fraction A</span>
                <input
                  type="number"
                  value={numA}
                  onChange={(e) => setNumA(parseInt(e.target.value) || 0)}
                  className="w-20 border text-center font-mono font-bold rounded-lg p-1.5 focus:border-indigo-500"
                  placeholder="Numerator"
                />
                <div className="w-16 h-1 bg-slate-400 rounded"></div>
                <input
                  type="number"
                  value={denA}
                  onChange={(e) => setDenA(parseInt(e.target.value) || 1)}
                  className="w-20 border text-center font-mono font-bold rounded-lg p-1.5 focus:border-indigo-500"
                  placeholder="Denominator"
                />
              </div>

              {/* Operator */}
              <div className="flex flex-col items-center gap-2">
                <span className="text-xs text-slate-400 uppercase font-extrabold tracking-wider">operator</span>
                <select
                  value={fractionOp}
                  onChange={(e) => setFractionOp(e.target.value as any)}
                  className="border rounded-lg p-1.5 bg-white font-mono text-base font-bold text-indigo-700 focus:outline-none"
                >
                  <option value="+">+</option>
                  <option value="-">-</option>
                  <option value="*">&times;</option>
                  <option value="/">&divide;</option>
                </select>
              </div>

              {/* Fraction B */}
              <div className="flex flex-col items-center gap-2">
                <span className="text-xs text-slate-400 uppercase font-extrabold tracking-wider">Fraction B</span>
                <input
                  type="number"
                  value={numB}
                  onChange={(e) => setNumB(parseInt(e.target.value) || 0)}
                  className="w-20 border text-center font-mono font-bold rounded-lg p-1.5 focus:border-indigo-500"
                  placeholder="Numerator"
                />
                <div className="w-16 h-1 bg-slate-400 rounded"></div>
                <input
                  type="number"
                  value={denB}
                  onChange={(e) => setDenB(parseInt(e.target.value) || 1)}
                  className="w-20 border text-center font-mono font-bold rounded-lg p-1.5 focus:border-indigo-500"
                  placeholder="Denominator"
                />
              </div>

              {/* CTA */}
              <div className="flex items-center h-full pt-4">
                <button
                  onClick={solveFraction}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow transition-all flex items-center gap-1 text-sm cursor-pointer"
                >
                  Simplify Result
                </button>
              </div>
            </div>

            {fractionResult && (
              <div className="mt-6 bg-indigo-50 px-5 py-4 border border-indigo-100 rounded-2xl flex flex-col items-center text-indigo-950 font-sans shadow-sm">
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-500 mb-2">Simplified Fractional Output</span>
                
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center gap-1 font-mono text-xl font-bold">
                    <span>{fractionResult.num}</span>
                    <div className="w-12 h-0.5 bg-indigo-900"></div>
                    <span>{fractionResult.den}</span>
                  </div>
                  <span className="text-lg text-indigo-400">=</span>
                  <div className="text-right">
                    <span className="block text-2xl font-mono font-semibold text-indigo-800">{fractionResult.approx.toFixed(6)}</span>
                    <span className="text-[10px] text-slate-400">Approximate decimal</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: Percentages Model */}
        {calcTab === "percentages" && (
          <div className="max-w-xl mx-auto" id="percentage-calc-panel">
            <h4 className="text-sm font-bold text-slate-700 mb-4 text-center">Solve Percentage Constants Faster</h4>
            
            <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl">
              <div className="flex flex-wrap items-center justify-center gap-3 text-slate-700 text-sm font-semibold font-sans">
                <span>What is</span>
                <input
                  type="number"
                  value={percentX}
                  onChange={(e) => setPercentX(parseFloat(e.target.value) || 0)}
                  className="w-20 p-2 border border-slate-300 rounded-lg text-center font-mono focus:border-indigo-500 focus:outline-none"
                />
                <span className="text-indigo-600">%</span>
                <span>of</span>
                <input
                  type="number"
                  value={percentY}
                  onChange={(e) => setPercentY(parseFloat(e.target.value) || 0)}
                  className="w-24 p-2 border border-slate-300 rounded-lg text-center font-mono focus:border-indigo-500 focus:outline-none"
                />
                <span>?</span>

                <button
                  onClick={solvePercentage}
                  className="ml-3 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow transition-all cursor-pointer"
                >
                  Solve
                </button>
              </div>

              {percentResult !== null && (
                <div className="mt-6 bg-emerald-50 text-emerald-950 border border-emerald-100 p-4 rounded-xl flex items-center justify-between font-sans">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-mono font-black text-sm">
                      %
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 block uppercase font-extrabold tracking-wider">Solution Process</span>
                      <p className="text-xs text-slate-600">({percentX} &divide; 100) &times; {percentY}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-mono font-bold text-emerald-800">{percentResult.toLocaleString("en-US", { maximumFractionDigits: 4 })}</span>
                    <span className="text-[10px] text-slate-400 block font-normal">Exact answer</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .btn-calc {
          background-color: #1e293b;
          border: 1px solid #334155;
          color: #f1f5f9;
          font-size: 0.825rem;
          padding: 0.75rem 0.25rem;
          border-radius: 0.75rem;
          font-family: inherit;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-calc:hover {
          background-color: #334155;
        }
        .btn-calc-num {
          background-color: #0f172a;
          border: 1px solid #1e293b;
          color: #cbd5e1;
          font-weight: 700;
          font-family: 'JetBrains Mono', Courier, monospace;
          cursor: pointer;
          padding: 0.75rem 0.25rem;
          border-radius: 0.75rem;
          transition: all 0.2s;
        }
        .btn-calc-num:hover {
          background-color: #1e293b;
        }
      `}</style>
    </div>
  );
}
