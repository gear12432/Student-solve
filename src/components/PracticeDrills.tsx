import { useState } from "react";
import { Layers, GraduationCap, ChevronRight, HelpCircle, CheckCircle2, XCircle, AlertCircle, RotateCcw, Award } from "lucide-react";
import { QuizQuestion } from "../types";

interface PracticeDrillsProps {
  onLogProgress: (category: string, activityName: string, score?: number, total?: number) => void;
}

export default function PracticeDrills({ onLogProgress }: PracticeDrillsProps) {
  // Config state
  const [drillCategory, setDrillCategory] = useState("algebraic_identities");
  const [drillLevel, setDrillLevel] = useState("intermediate");
  const [isLoading, setIsLoading] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [errorMsg, setErrorMsg] = useState("");

  // Quiz execution state
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [answerChecked, setAnswerChecked] = useState(false);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);

  const startDrills = async () => {
    setIsLoading(true);
    setErrorMsg("");
    setQuizQuestions([]);
    setCurrentIdx(0);
    setSelectedOption(null);
    setAnswerChecked(false);
    setCorrectAnswersCount(0);
    setShowHint(false);
    setQuizFinished(false);

    try {
      const response = await fetch("/api/tutor/drills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: drillCategory, level: drillLevel }),
      });

      if (!response.ok) {
        throw new Error("Drills server returned an error. Please try again.");
      }

      const data = await response.json();
      if (!data.drills || data.drills.length === 0) {
        throw new Error("No quiz questions were generated. Try a different discipline.");
      }

      setQuizQuestions(data.drills);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to organize drills.");
    } finally {
      setIsLoading(false);
    }
  };

  const checkAnswer = () => {
    if (!selectedOption) return;
    setAnswerChecked(true);
    const currQuestion = quizQuestions[currentIdx];
    if (selectedOption === currQuestion.correctAnswer) {
      setCorrectAnswersCount(c => c + 1);
    }
  };

  const handleNext = () => {
    setSelectedOption(null);
    setAnswerChecked(false);
    setShowHint(false);

    if (currentIdx + 1 < quizQuestions.length) {
      setCurrentIdx(currentIdx + 1);
    } else {
      // Quiz finished! Write progress log.
      setQuizFinished(true);
      const readableCategory = drillCategory.replace(/_/g, " ");
      onLogProgress(
        drillCategory,
        `Completed ${readableCategory} Drill (${drillLevel})`,
        correctAnswersCount,
        quizQuestions.length
      );
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden" id="practice-drills-frame">
      {/* Banner */}
      <div className="bg-slate-50 border-b border-slate-100 p-6">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-indigo-600" />
          Math Drills, Quizzes, & General Exam Prep
        </h2>
        <p className="text-xs text-slate-500">
          Reinforce counting tables, squares/cubes rules, geometry ratios, algebra rules through AI generated practice sheets.
        </p>
      </div>

      <div className="p-6">
        {quizQuestions.length === 0 && !isLoading && (
          <div id="drill-generator-options" className="max-w-xl mx-auto space-y-6 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Subject matter</label>
                <select
                  value={drillCategory}
                  onChange={(e) => setDrillCategory(e.target.value)}
                  className="w-full border rounded-xl p-2.5 text-sm bg-white text-slate-700 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="fractions_and_decimals">Fractions & Arithmetic</option>
                  <option value="multiplication_tables">Multiplication & Multiples</option>
                  <option value="exponents_and_roots">Powers (Squares, Cubes & Roots)</option>
                  <option value="algebraic_identities">Algebraic Identities (Formula expansion)</option>
                  <option value="geometry_and_trigonometry">Geometry & Trigonometry rules</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Drill mode / level</label>
                <select
                  value={drillLevel}
                  onChange={(e) => setDrillLevel(e.target.value)}
                  className="w-full border rounded-xl p-2.5 text-sm bg-white text-slate-700 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="beginner">Beginner Warm-up</option>
                  <option value="intermediate">Intermediate Workout</option>
                  <option value="exam_prep">Rigorous Exam Prep (Standardized style)</option>
                </select>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 text-red-700 border border-red-100 rounded-xl text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            <button
              onClick={startDrills}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md cursor-pointer transition-all text-sm block"
            >
              Generate Custom Exercises
            </button>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12 space-y-3" id="drills-loading">
            <GraduationCap className="w-12 h-12 text-indigo-500 animate-bounce" />
            <span className="text-sm font-semibold text-slate-600">Generating customized quiz sheets...</span>
            <span className="text-[10px] text-slate-400">Leveraging Gemini key matrices for educational accuracy</span>
          </div>
        )}

        {/* Active Quiz Question Card */}
        {quizQuestions.length > 0 && !quizFinished && (
          <div className="max-w-2xl mx-auto" id="quiz-runner-box">
            {/* ProgressBar */}
            <div className="flex items-center justify-between mb-4 text-xs text-slate-400 font-bold uppercase tracking-wider">
              <span>Question {currentIdx + 1} of {quizQuestions.length}</span>
              <span>Score: {correctAnswersCount} correct</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-6">
              <div
                className="bg-indigo-600 h-full transition-all duration-300"
                style={{ width: `${((currentIdx + 1) / quizQuestions.length) * 100}%` }}
              ></div>
            </div>

            {/* Question Text */}
            <div className="bg-slate-50 border border-slate-100/80 p-5 rounded-2xl mb-6">
              <h3 className="text-base font-bold text-slate-800 leading-relaxed font-sans">{quizQuestions[currentIdx].question}</h3>
            </div>

            {/* Options list */}
            <div className="space-y-3">
              {quizQuestions[currentIdx].options.map((opt, idx) => {
                const isSelected = selectedOption === opt;
                let optStyle = "border-slate-200 hover:bg-slate-50 text-slate-700";
                
                if (isSelected) {
                  optStyle = "border-indigo-600 bg-indigo-50/50 text-indigo-900 font-semibold";
                }

                if (answerChecked) {
                  const isCorrect = opt === quizQuestions[currentIdx].correctAnswer;
                  if (isCorrect) {
                     optStyle = "border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold";
                  } else if (isSelected) {
                     optStyle = "border-red-500 bg-red-50 text-red-900";
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={answerChecked}
                    onClick={() => setSelectedOption(opt)}
                    className={`w-full p-3.5 border rounded-xl text-left text-sm transition-all flex items-center justify-between ${optStyle} font-sans disabled:cursor-not-allowed`}
                  >
                    <span>{opt}</span>
                    {answerChecked && opt === quizQuestions[currentIdx].correctAnswer && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Feedback panels */}
            {answerChecked && (
              <div className="mt-6 p-4 rounded-xl border border-slate-100 bg-slate-50 text-xs text-slate-600 space-y-2">
                <div className="flex items-center gap-1.5 font-bold">
                  {selectedOption === quizQuestions[currentIdx].correctAnswer ? (
                    <span className="text-emerald-700 flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Correct Answer!</span>
                  ) : (
                    <span className="text-red-700 flex items-center gap-1"><XCircle className="w-4 h-4" /> Incorrect</span>
                  )}
                </div>
                <p className="leading-relaxed font-sans mt-1">
                  <strong>Concept focus:</strong> {quizQuestions[currentIdx].conceptExplanation}
                </p>
              </div>
            )}

            {/* Quiz controls */}
            <div className="mt-8 flex justify-between items-center flex-wrap gap-4 pt-4 border-t border-slate-100">
              <button
                type="button"
                id="hint-btn"
                onClick={() => setShowHint(!showHint)}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
              >
                <HelpCircle className="w-4 h-4" /> {showHint ? "Hide dynamic hint" : "Show AI Tutor Hint"}
              </button>

              <div className="flex gap-2">
                {!answerChecked ? (
                  <button
                    onClick={checkAnswer}
                    disabled={!selectedOption}
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow cursor-pointer uppercase tracking-wider"
                  >
                    Check
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="px-6 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow cursor-pointer uppercase tracking-wider flex items-center gap-1"
                  >
                    Next {currentIdx + 1 === quizQuestions.length ? "Finish" : <ChevronRight className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            </div>

            {showHint && (
              <div id="ai-hint-bubble" className="mt-3 bg-amber-50 border border-amber-200/60 p-3.5 rounded-xl flex items-start gap-2 animate-fadeIn text-xs text-amber-900 font-sans">
                <AlertCircle className="w-4 h-3.5 text-amber-600 mt-0.5" />
                <div>
                  <strong className="block font-bold mb-1">Tutor Pedagogical Hint:</strong>
                  {quizQuestions[currentIdx].stepByStepHint}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quiz Completed */}
        {quizFinished && (
          <div className="max-w-md mx-auto text-center py-6 space-y-6" id="quiz-summary-completed">
            <Award className="w-16 h-16 text-indigo-600 mx-auto animate-bounce" />
            
            <div>
              <h3 className="text-xl font-black text-slate-800">Practice Drill Completed!</h3>
              <p className="text-xs text-slate-500 mt-1 uppercase font-semibold tracking-wider bg-slate-100 px-3 py-1 rounded inline-block">
                Score: {correctAnswersCount} / {quizQuestions.length} ({Math.round((correctAnswersCount / quizQuestions.length) * 100)}%)
              </p>
            </div>

            <div className="bg-indigo-50/50 p-4 rounded-2xl text-xs text-indigo-900 font-sans border border-indigo-100">
              <p className="leading-relaxed">
                Your performance scores have been safely written to your cloud profile tracker stream. Consistency builds supreme operational stamina. Maintain your streak!
              </p>
            </div>

            <button
              onClick={() => setQuizQuestions([])}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-md inline-flex items-center gap-1.5 cursor-pointer text-sm"
            >
              <RotateCcw className="w-4 h-4" /> Start another study block
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
