import { useState } from "react";
import { Search, Bookmark, ChevronLeft, ChevronRight, Hash, Grid, Key, Layers, Compass, Star } from "lucide-react";
import { Formula } from "../types";

const ALGEBRAIC_IDENTITIES = [
  { id: "alg-1", name: "Square of Sum", formula: "(a + b)平方 = a² + 2ab + b²", explanation: "Calculates the area of a square composed of sub-squares and rectangles.", example: "(3 + 2)² = 9 + 12 + 4 = 25" },
  { id: "alg-2", name: "Square of Difference", formula: "(a - b)平方 = a² - 2ab + b²", explanation: "Expresses visual area difference of adjacent square sizes.", example: "(5 - 2)² = 25 - 20 + 4 = 9" },
  { id: "alg-3", name: "Difference of Squares", formula: "a² - b² = (a - b)(a + b)", explanation: "Allows swift factorization of squared integers or variables.", example: "7² - 3² = (7 - 3)(7 + 3) = 4 * 10 = 40" },
  { id: "alg-4", name: "Cube of Sum", formula: "(a + b)立方 = a³ + 3a²b + 3ab² + b³", explanation: "Expands volumetric algebraic structures for three dimensions.", example: "(2 + 1)³ = 8 + 12 + 6 + 1 = 27" },
  { id: "alg-5", name: "Cube of Difference", formula: "(a - b)立方 = a³ - 3a²b + 3ab² - b³", explanation: "Unveils cubic volumetric dimensional space decrease values.", example: "(3 - 1)³ = 27 - 27 + 9 - 1 = 8" }
];

const FORMULA_LIBRARY: Formula[] = [
  { id: "geo-1", name: "Area of a Circle", formula: "A = π * r²", meaning: "π (pi) ≈ 3.14159, r = radius of circle", category: "geometry", example: "Circle with r=4, A = 3.14 * 16 ≈ 50.27", explanation: "Determines total space enclosed inside circular boundaries." },
  { id: "geo-2", name: "Pythagorean Theorem", formula: "a² + b² = c²", meaning: "a, b = short legs, c = hypotenuse of right triangle", category: "geometry", example: "Legs 3 & 4, Hypotenuse c = √(9+16) = 5", explanation: "Relates lengths of legs in rigid 90-degree triangles." },
  { id: "geo-3", name: "Volume of a Sphere", formula: "V = (4/3) * π * r³", meaning: "r = radius of spatial sphere", category: "geometry", example: "Sphere r=3, V = (4/3)*3.14*27 ≈ 113.1", explanation: "Measures 3D volume content capacity of an ideal round ball shape." },
  { id: "tri-1", name: "Basic Trig Identity", formula: "sin²(θ) + cos²(θ) = 1", meaning: "θ = angle in radians or degrees", category: "trigonometry", example: "sin(30°)² + cos(30°)² = 0.5² + 0.866² = 0.25 + 0.75 = 1", explanation: "The fundamental Pythagorean trigonometric constant rule." },
  { id: "tri-2", name: "Tangent Ratio", formula: "tan(θ) = sin(θ) / cos(θ) = Opposite / Adjacent", meaning: "θ = acute angle inside right triangle", category: "trigonometry", example: "tan(45°) = 1 / 1 = 1", explanation: "Relates slope steepness to circular angular values." },
  { id: "tri-3", name: "Double Angle Sine", formula: "sin(2θ) = 2 * sin(θ) * cos(θ)", meaning: "θ = base circular angle size", category: "trigonometry", example: "sin(90°) = 2*sin(45°)*cos(45°) = 2 * 0.707 * 0.707 = 1", explanation: "Allows breaking complex composite speed angles into base ratios." }
];

interface ReferenceGuidesProps {
  onBookmarkAdd: (title: string, category: string, itemKey: string) => void;
  bookmarkedKeys: string[];
}

export default function ReferenceGuides({ onBookmarkAdd, bookmarkedKeys }: ReferenceGuidesProps) {
  const [activeTab, setActiveTab] = useState<"counting" | "multiplication" | "powers" | "algebra" | "formulas">("counting");
  const [searchQuery, setSearchQuery] = useState("");

  // Counting table pagination config
  const [countingPage, setCountingPage] = useState(0);
  const COUNTING_PAGE_SIZE = 100;
  const totalCountingDigits = 1000;

  // Multiplication selection config
  const [multiplier, setMultiplier] = useState(7);
  const [customPowerLimit, setCustomPowerLimit] = useState(20);

  // Helper arrays for powers
  const powerNumbers = Array.from({ length: customPowerLimit }, (_, i) => i + 1);

  // Handle pagination for counting tables
  const startNum = countingPage * COUNTING_PAGE_SIZE + 1;
  const endNum = Math.min((countingPage + 1) * COUNTING_PAGE_SIZE, totalCountingDigits);
  const countingList = Array.from({ length: endNum - startNum + 1 }, (_, i) => startNum + i);

  // Filter formulas based on search
  const filteredFormulas = FORMULA_LIBRARY.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.formula.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.explanation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredIdentities = ALGEBRAIC_IDENTITIES.filter(i =>
    i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.formula.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden" id="math-references-frame">
      {/* Top Banner Navigation */}
      <div className="bg-slate-50 border-b border-slate-100 p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Compass className="w-5 nav-icon h-5 text-indigo-600" />
              Interactive Academic Tables & Formula Libraries
            </h2>
            <p className="text-xs text-slate-500">
              Interactive sheets for foundational math parameters, powers, algebra, and essential trig formulas.
            </p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search reference library..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-1.5 w-full md:w-64 text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 font-sans"
            />
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-wrap gap-2 mt-4">
          {[
            { id: "counting", label: "Counting Grid (1-1000)", icon: Hash },
            { id: "multiplication", label: "Multiplication Sheets", icon: Grid },
            { id: "powers", label: "Powers & Roots (x², x³, √)", icon: Key },
            { id: "algebra", label: "Algebraic Identities", icon: Layers },
            { id: "formulas", label: "Formula Companion", icon: Star },
          ].map((tab) => {
            const IconComp = tab.icon;
            return (
              <button
                key={tab.id}
                id={`tab-btn-${tab.id}`}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                  activeTab === tab.id
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-white hover:bg-slate-100 text-slate-600 border border-slate-200"
                }`}
              >
                <IconComp className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-6">
        {/* TAB 1: Counting Tables */}
        {activeTab === "counting" && (
          <div id="counting-grid-container">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-slate-700">
                Displaying integers <span className="text-indigo-600 font-mono font-bold">{startNum}</span> to <span className="text-indigo-600 font-mono font-bold">{endNum}</span> of 1000
              </span>
              <div className="flex gap-2">
                <button
                  disabled={countingPage === 0}
                  onClick={() => setCountingPage(p => p - 1)}
                  className="p-1 px-3 bg-slate-100 hover:bg-slate-200 rounded text-slate-600 text-xs font-bold disabled:opacity-40 flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Previous
                </button>
                <button
                  disabled={(countingPage + 1) * COUNTING_PAGE_SIZE >= totalCountingDigits}
                  onClick={() => setCountingPage(p => p + 1)}
                  className="p-1 px-3 bg-slate-100 hover:bg-slate-200 rounded text-slate-600 text-xs font-bold disabled:opacity-40 flex items-center gap-1"
                >
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {countingList.map((num) => (
                <div
                  key={num}
                  id={`counting-number-${num}`}
                  className="h-10 border border-indigo-50/60 rounded flex items-center justify-center font-mono text-sm font-medium hover:bg-indigo-50 transition-colors bg-slate-50 text-slate-700 hover:text-indigo-700"
                >
                  {num}
                </div>
              ))}
            </div>
            
            <div className="mt-4 flex flex-wrap gap-2 justify-center border-t border-slate-100 pt-4">
              {Array.from({ length: 10 }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCountingPage(idx)}
                  className={`px-3 py-1 font-mono text-xs rounded border ${
                    countingPage === idx
                      ? "bg-indigo-50 text-indigo-700 border-indigo-200 font-bold"
                      : "bg-white text-slate-500 hover:bg-slate-50 border-slate-200"
                  }`}
                >
                  {(idx * 100) + 1}-{ (idx + 1) * 100 }
                </button>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: Multiplication Tables */}
        {activeTab === "multiplication" && (
          <div id="multiplication-container">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between mb-6">
              <div>
                <label className="text-xs font-bold text-slate-500 block uppercase mb-1">Set Active Digit multiplier</label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={multiplier}
                    onChange={(e) => setMultiplier(parseInt(e.target.value) || 1)}
                    className="w-48 outline-none h-1.5 bg-slate-200 rounded"
                  />
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={multiplier}
                    onChange={(e) => setMultiplier(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                    className="w-16 border rounded text-slate-700 text-center font-mono font-bold text-sm py-1 border-slate-300"
                  />
                  <span className="text-xs text-slate-500 font-sans">(Up to 100 supported)</span>
                </div>
              </div>
              <button
                id="btn-bookmark-mult"
                onClick={() => onBookmarkAdd(`Multiplication Table for ${multiplier}`, "multiplication", `table-${multiplier}`)}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs border rounded-lg font-semibold tracking-wide ${
                  bookmarkedKeys.includes(`table-${multiplier}`)
                    ? "bg-amber-50 border-amber-200 text-amber-700"
                    : "bg-white hover:bg-slate-50 text-slate-500 border-slate-300"
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                {bookmarkedKeys.includes(`table-${multiplier}`) ? "Bookmarked" : "Bookmark this sheet"}
              </button>
            </div>

            <h3 className="text-base font-bold text-slate-800 mb-3 border-l-4 border-indigo-600 pl-2">
              Multiplication sheet for <span className="text-indigo-600 font-mono">{multiplier}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {Array.from({ length: 20 }, (_, i) => i + 1).map((factor) => (
                <div
                  key={factor}
                  className="p-3 bg-slate-50 hover:bg-indigo-50/50 border border-slate-200/60 rounded-xl transition-all"
                >
                  <div className="text-xs text-slate-400 font-mono flex justify-between">
                    <span>Multiply by {factor}</span>
                    <span>#{factor}</span>
                  </div>
                  <div className="text-base text-slate-700 font-bold font-mono mt-1">
                    {multiplier} &times; {factor} = <span className="text-indigo-600">{multiplier * factor}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: Powers & Roots */}
        {activeTab === "powers" && (
          <div id="powers-roots-container">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <span className="text-sm font-semibold text-slate-700">Powers & roots calculated for first {customPowerLimit} integers:</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Integer scope:</span>
                <select
                  value={customPowerLimit}
                  onChange={(e) => setCustomPowerLimit(parseInt(e.target.value))}
                  className="text-xs border border-slate-300 rounded p-1"
                >
                  <option value={10}>1 to 10</option>
                  <option value={20}>1 to 20</option>
                  <option value={50}>1 to 50</option>
                  <option value={100}>1 to 100</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm font-sans border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-xs uppercase">
                    <th className="p-3">Base (x)</th>
                    <th className="p-3">Square (x²)</th>
                    <th className="p-3">Cube (x³)</th>
                    <th className="p-3">Square Root (√x)</th>
                    <th className="p-3">Cube Root (∛x)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
                  {powerNumbers.map((n) => (
                    <tr key={n} className="hover:bg-indigo-50/30 transition-colors">
                      <td className="p-3 font-bold text-indigo-600">{n}</td>
                      <td className="p-3">{n * n}</td>
                      <td className="p-3">{n * n * n}</td>
                      <td className="p-3 text-emerald-600">{Math.sqrt(n).toFixed(4)}</td>
                      <td className="p-3 text-orange-600">{Math.cbrt(n).toFixed(4)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: Algebraic Identities */}
        {activeTab === "algebra" && (
          <div className="space-y-4" id="algebraic-identities-list">
            {filteredIdentities.length === 0 ? (
              <p className="text-slate-400 text-center text-sm py-8">No algebraic identities match your query.</p>
            ) : (
              filteredIdentities.map((item) => (
                <div
                  key={item.id}
                  className="p-5 border border-slate-100 rounded-2xl hover:shadow-md transition-shadow duration-300"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <span className="text-xs uppercase font-extrabold text-blue-600 tracking-wider">Algebra Key Ident</span>
                      <h4 className="text-base font-bold text-slate-800 mt-0.5">{item.name}</h4>
                    </div>
                    <button
                      onClick={() => onBookmarkAdd(item.name, "algebraic_identities", item.id)}
                      className={`p-1.5 rounded-lg border ${
                        bookmarkedKeys.includes(item.id)
                          ? "bg-amber-50 text-amber-500 border-amber-200"
                          : "bg-white text-slate-400 hover:bg-slate-50 border-slate-200"
                      }`}
                    >
                      <Bookmark className="w-4 nav-icon h-4" />
                    </button>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-3.5 my-3 rounded-xl">
                    <code className="text-emerald-400 font-mono text-sm md:text-base font-semibold block text-center">
                      {item.formula}
                    </code>
                  </div>
                  <div className="text-xs text-slate-600">
                    <p className="font-sans leading-relaxed mb-2">
                      <strong className="text-slate-700">Explanation:</strong> {item.explanation}
                    </p>
                    <p className="font-mono text-indigo-600">
                      <strong className="font-sans text-slate-700">Example application:</strong> {item.example}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 5: Formula Library */}
        {activeTab === "formulas" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="formula-companion-grid">
            {filteredFormulas.length === 0 ? (
              <p className="text-slate-400 text-center text-sm py-8 col-span-2">No formula records math your search terms.</p>
            ) : (
              filteredFormulas.map((f) => (
                <div
                  key={f.id}
                  className="p-5 border border-slate-100/80 rounded-2xl bg-white hover:border-slate-200 transition-colors shadow-sm"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-indigo-50 text-indigo-700 tracking-wider">
                        {f.category}
                      </span>
                      <h4 className="text-base font-bold text-slate-800 mt-1">{f.name}</h4>
                    </div>
                    <button
                      onClick={() => onBookmarkAdd(f.name, f.category, f.id)}
                      className={`p-1.5 rounded-lg border ${
                        bookmarkedKeys.includes(f.id)
                          ? "bg-amber-50 text-amber-500 border-amber-200"
                          : "bg-white text-slate-404 hover:bg-slate-50 border-slate-200"
                      }`}
                    >
                      <Bookmark className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="bg-indigo-950/95 border border-indigo-900/45 p-3 my-3 rounded-xl">
                    <code className="text-amber-300 font-mono text-sm font-semibold block text-center">
                      {f.formula}
                    </code>
                  </div>

                  <div className="text-xs space-y-1.5 text-slate-600 font-sans">
                    <p>
                      <strong>Variable Meaning:</strong> <span className="font-mono bg-slate-50 px-1 rounded">{f.meaning}</span>
                    </p>
                    <p>
                      <strong>Definition:</strong> {f.explanation}
                    </p>
                    <p className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg font-mono">
                      <strong>Sample:</strong> {f.example}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
