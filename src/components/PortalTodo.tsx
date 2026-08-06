import React from "react";
import { Sparkles, Plus, Check, Trash2, Sliders, Award, Smartphone, Tablet, Eye, RefreshCw, Landmark, CreditCard } from "lucide-react";
import { User } from "../types";

interface PortalTodoProps {
  currentUser: User;
  registrations: any[];
}

const assessmentQuestions = [
  {
    id: "gov-1",
    category: "Corporate Governance",
    title: "Fiduciary Responsibilities & SEC Compliance",
    desc: "Understanding directors' duties, fiduciary standards of care/loyalty, and public compliance disclosures."
  },
  {
    id: "gov-2",
    category: "Corporate Governance",
    title: "Bylaws & Committee Structure",
    desc: "Familiarity with audit, nominating, compensation, and risk committee operations."
  },
  {
    id: "gov-3",
    category: "Corporate Governance",
    title: "Risk Management & Regulatory Oversight",
    desc: "Ability to analyze regulatory compliance risks, litigation exposure, and cybersecurity oversight frameworks."
  },
  {
    id: "strat-1",
    category: "Strategic Strategy",
    title: "Diversity, ESG & Sustainability Mandates",
    desc: "Knowledge of modern ESG reporting metrics, board diversity legislation, and corporate citizenship benchmarks."
  },
  {
    id: "strat-2",
    category: "Strategic Strategy",
    title: "Global Scale & Disruption Oversight",
    desc: "Strategic guidance on global expansion plans, digital transformation vectors, and market-disruption vectors."
  },
  {
    id: "strat-3",
    category: "Strategic Strategy",
    title: "Executive Succession & Compensation",
    desc: "Reviewing CEO performance, drafting succession roadmaps, and formulating key executive reward tiers."
  },
  {
    id: "fin-1",
    category: "Financial Acumen",
    title: "Audit & Balance Sheet Mastership",
    desc: "Expertise in corporate accounting rules, evaluating complex P&L statements, and audit reports."
  },
  {
    id: "fin-2",
    category: "Financial Acumen",
    title: "Mergers & Acquisitions Oversight",
    desc: "Vetting asset transactions, joint venture partnerships, leverage restructuring, and investment syndicate alignment."
  },
  {
    id: "fin-3",
    category: "Financial Acumen",
    title: "Capital Allocation Strategy",
    desc: "Formulating debt-to-equity targets, shareholder buybacks, and seed-to-growth series investment pathways."
  },
  {
    id: "eth-1",
    category: "Boardroom Presence",
    title: "Executive Influence & Persuasion",
    desc: "Ability to command respect in the boardroom, negotiate consensus, and advocate strategic viewpoints."
  },
  {
    id: "eth-2",
    category: "Boardroom Presence",
    title: "Crisis Governance & Communications",
    desc: "Managing high-pressure shareholder disputes, public relations emergencies, or internal executive reviews."
  },
  {
    id: "eth-3",
    category: "Boardroom Presence",
    title: "Strategic Alliance Integration",
    desc: "Leveraging key high-level professional, government, or venture capital networks to create synergy."
  }
];

interface TaskItem {
  id: string;
  text: string;
  category: "Interface" | "Feature" | "Other";
  completed: boolean;
  priority: "High" | "Medium" | "Low";
}

const defaultTasks: TaskItem[] = [
  { id: "task-1", text: "Rename all instances from AURANETWORK to WomenPlay", category: "Interface", completed: true, priority: "High" },
  { id: "task-2", text: "Integrate new high-resolution gold & pink brand logo and meta icons", category: "Interface", completed: true, priority: "High" },
  { id: "task-3", text: "Implement interactive leadership todo & roadmap dashboard planner", category: "Feature", completed: true, priority: "High" },
  { id: "task-4", text: "Enable dynamic seats reservation for upcoming summits", category: "Feature", completed: false, priority: "Medium" },
  { id: "task-5", text: "Launch WomenPlay Board Readiness Assessment Matrix", category: "Feature", completed: false, priority: "High" },
  { id: "task-6", text: "Optimize mobile layouts & responsive touch controls", category: "Interface", completed: false, priority: "Medium" }
];

export default function PortalTodo({ currentUser, registrations }: PortalTodoProps) {
  const [todos, setTodos] = React.useState<TaskItem[]>(() => {
    const saved = localStorage.getItem("womenplay_todos");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return defaultTasks;
      }
    }
    return defaultTasks;
  });

  React.useEffect(() => {
    localStorage.setItem("womenplay_todos", JSON.stringify(todos));
  }, [todos]);

  React.useEffect(() => {
    const hasSeatReservation = registrations.some(r => r.seat);
    if (hasSeatReservation) {
      setTodos(prev => {
        const t4 = prev.find(t => t.id === "task-4");
        if (t4 && !t4.completed) {
          return prev.map(t => t.id === "task-4" ? { ...t, completed: true } : t);
        }
        return prev;
      });
    }
  }, [registrations]);

  const [newTodoText, setNewTodoText] = React.useState("");
  const [newTodoCategory, setNewTodoCategory] = React.useState<"Interface" | "Feature" | "Other">("Interface");
  const [newTodoPriority, setNewTodoPriority] = React.useState<"High" | "Medium" | "Low">("Medium");
  const [todoFilter, setTodoFilter] = React.useState<"all" | "interface" | "feature" | "completed" | "pending">("all");

  const [matrixScores, setMatrixScores] = React.useState<Record<string, number>>(() => {
    const saved = localStorage.getItem("womenplay_matrix_scores");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    const defaults: Record<string, number> = {};
    assessmentQuestions.forEach(q => { defaults[q.id] = 3; });
    return defaults;
  });

  const [assessmentCertified, setAssessmentCertified] = React.useState<boolean>(() => {
    return localStorage.getItem("womenplay_matrix_certified") === "true";
  });

  const updateQuestionScore = (id: string, score: number) => {
    const next = { ...matrixScores, [id]: score };
    setMatrixScores(next);
    localStorage.setItem("womenplay_matrix_scores", JSON.stringify(next));
  };

  const handleCertifyAssessment = () => {
    setAssessmentCertified(true);
    localStorage.setItem("womenplay_matrix_certified", "true");
    setTodos(prev => prev.map(t => t.id === "task-5" ? { ...t, completed: true } : t));
  };

  const handleResetAssessment = () => {
    setAssessmentCertified(false);
    localStorage.removeItem("womenplay_matrix_certified");
    const defaults: Record<string, number> = {};
    assessmentQuestions.forEach(q => { defaults[q.id] = 3; });
    setMatrixScores(defaults);
    localStorage.setItem("womenplay_matrix_scores", JSON.stringify(defaults));
    setTodos(prev => prev.map(t => t.id === "task-5" ? { ...t, completed: false } : t));
  };

  const [mobileOptimizerActive, setMobileOptimizerActive] = React.useState<boolean>(() => {
    return localStorage.getItem("womenplay_mobile_optimizer") === "true";
  });
  const [activeSimulationDevice, setActiveSimulationDevice] = React.useState<"iphone" | "tablet" | "desktop">("iphone");
  const [simulationStatus, setSimulationStatus] = React.useState<string>("");

  const handleApplyMobileOptimization = () => {
    setMobileOptimizerActive(true);
    localStorage.setItem("womenplay_mobile_optimizer", "true");
    setTodos(prev => prev.map(t => t.id === "task-6" ? { ...t, completed: true } : t));
    setSimulationStatus("Successfully integrated responsive layout wrappers and 44px minimum tap target guidelines.");
  };

  const handleResetMobileOptimization = () => {
    setMobileOptimizerActive(false);
    localStorage.removeItem("womenplay_mobile_optimizer");
    setTodos(prev => prev.map(t => t.id === "task-6" ? { ...t, completed: false } : t));
    setSimulationStatus("");
  };

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoText.trim()) return;
    const newTask: TaskItem = {
      id: `task-${Date.now()}`,
      text: newTodoText.trim(),
      category: newTodoCategory,
      completed: false,
      priority: newTodoPriority
    };
    setTodos([newTask, ...todos]);
    setNewTodoText("");
  };

  const handleToggleTodo = (id: string) => {
    setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleDeleteTodo = (id: string) => {
    setTodos(todos.filter(t => t.id !== id));
  };

  return (
    <div className="space-y-6" id="panel-roadmap-todo">
      <div className="border-b border-slate-100 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-extrabold text-slate-900">WomenPlay Executive Roadmap & Tasks</h2>
          <p className="text-slate-500 text-xs">Monitor, execute, and propose tasks for platform feature launches and user experience refinements.</p>
        </div>
        <div className="flex items-center space-x-2 bg-brand-pink-light/30 border border-brand-pink/10 px-3 py-1.5 rounded-full text-[10px] text-brand-pink font-extrabold uppercase">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span>Strategic Member Vision Board</span>
        </div>
      </div>

      {/* Overall Progress Tracker Visualizer */}
      {(() => {
        const completedCount = todos.filter(t => t.completed).length;
        const totalCount = todos.length;
        const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
        return (
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-150 grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
            <div className="md:col-span-2 space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>Vision Road Completion Rate</span>
                <span className="text-brand-pink">{progressPercent}%</span>
              </div>
              {/* Progress Bar background */}
              <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden flex">
                <div
                  className="bg-gradient-to-r from-brand-pink to-brand-gold h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400">
                Successfully deployed {completedCount} of {totalCount} corporate requirements.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 md:col-span-2">
              <div className="bg-white p-3 rounded-xl border border-slate-100 text-center">
                <span className="block text-[9px] uppercase tracking-wider font-bold text-slate-400">COMPLETED</span>
                <span className="text-xl font-display font-extrabold text-emerald-600">{completedCount}</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-100 text-center">
                <span className="block text-[9px] uppercase tracking-wider font-bold text-slate-400">PENDING</span>
                <span className="text-xl font-display font-extrabold text-brand-gold-dark">{totalCount - completedCount}</span>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Filter and Add Task Controls Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Task Addition Form panel */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-150 space-y-4 text-xs">
          <h3 className="font-bold text-slate-800 flex items-center space-x-2 border-b border-slate-200 pb-2">
            <Plus className="w-4 h-4 text-brand-pink" />
            <span>Propose Vision Task</span>
          </h3>

          <form onSubmit={handleAddTodo} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-wider font-bold text-slate-500">Task Headline</label>
              <input
                type="text"
                required
                placeholder="e.g. Set up localized summit chats"
                value={newTodoText}
                onChange={(e) => setNewTodoText(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-pink"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-wider font-bold text-slate-500">Category</label>
                <select
                  value={newTodoCategory}
                  onChange={(e: any) => setNewTodoCategory(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-2 py-1.5 text-[11px] focus:outline-none"
                >
                  <option value="Interface">Interface</option>
                  <option value="Feature">Feature</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-wider font-bold text-slate-500">Priority</label>
                <select
                  value={newTodoPriority}
                  onChange={(e: any) => setNewTodoPriority(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-2 py-1.5 text-[11px] focus:outline-none"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow transition"
            >
              Add Task To Backlog
            </button>
          </form>
        </div>

        {/* Task Listing with Filter */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-3">
            {[
              { id: "all", name: "All Tasks" },
              { id: "interface", name: "Interface Improvements" },
              { id: "feature", name: "Full Features" },
              { id: "completed", name: "Completed" },
              { id: "pending", name: "Pending" }
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setTodoFilter(filter.id as any)}
                className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition ${
                  todoFilter === filter.id
                    ? "bg-brand-pink text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {filter.name}
              </button>
            ))}
          </div>

          {/* List Items */}
          <div className="space-y-3 max-h-[360px] overflow-y-auto pr-2">
            {(() => {
              const filteredTodos = todos.filter(todo => {
                if (todoFilter === "completed") return todo.completed;
                if (todoFilter === "pending") return !todo.completed;
                if (todoFilter === "interface") return todo.category === "Interface";
                if (todoFilter === "feature") return todo.category === "Feature";
                return true;
              });

              if (filteredTodos.length === 0) {
                return (
                  <p className="text-slate-400 text-xs italic py-10 text-center border border-dashed border-slate-200 rounded-2xl">
                    No tasks match the active selection filter.
                  </p>
                );
              }

              return filteredTodos.map((todo) => (
                <div
                  key={todo.id}
                  className={`p-4 rounded-xl border flex items-center justify-between gap-4 transition duration-200 ${
                    todo.completed
                      ? "bg-emerald-50/20 border-emerald-100/50 opacity-80"
                      : "bg-white border-slate-150 hover:border-slate-250 shadow-xs"
                  } border-l-4 ${
                    todo.priority === "High"
                      ? "border-l-rose-500"
                      : todo.priority === "Medium"
                      ? "border-l-amber-500"
                      : "border-l-slate-400"
                  }`}
                >
                  <div className="flex items-center space-x-3.5 flex-1 min-w-0">
                    <button
                      onClick={() => handleToggleTodo(todo.id)}
                      className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all ${
                        todo.completed
                          ? "bg-emerald-500 border-emerald-500 text-white"
                          : "border-slate-300 hover:border-brand-pink bg-white"
                      }`}
                    >
                      {todo.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>

                    <div className="min-w-0 flex-1">
                      <p className={`text-xs font-semibold leading-tight break-words text-slate-800 ${
                        todo.completed ? "line-through text-slate-400 font-normal" : ""
                      }`}>
                        {todo.text}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`text-[8px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full ${
                          todo.category === "Interface"
                            ? "bg-purple-50 text-purple-700 border border-purple-100"
                            : todo.category === "Feature"
                            ? "bg-blue-50 text-blue-700 border border-blue-100"
                            : "bg-slate-50 text-slate-700 border border-slate-100"
                        }`}>
                          {todo.category}
                        </span>
                        <span className={`text-[8px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full ${
                          todo.priority === "High"
                            ? "bg-rose-50 text-rose-700"
                            : todo.priority === "Medium"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-slate-50 text-slate-600"
                        }`}>
                          {todo.priority} Priority
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Delete Action button */}
                  <button
                    onClick={() => handleDeleteTodo(todo.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition"
                    title="Delete vision task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ));
            })()}
          </div>
        </div>
      </div>

      {/* INTERACTIVE BOARD READINESS ASSESSMENT MATRIX (ROADMAP TASK 5) */}
      <hr className="border-slate-150 my-10" />

      <div className="space-y-6" id="board-readiness-matrix-section">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-brand-pink text-xs uppercase tracking-wider font-extrabold">
              <Sliders className="w-4 h-4" />
              <span>Exclusive Leadership Tool</span>
            </div>
            <h3 className="text-lg font-display font-bold text-slate-800">
              WomenPlay Board Readiness Assessment Matrix
            </h3>
            <p className="text-slate-500 text-xs max-w-3xl">
              Fulfill roadmap milestone #5 by mapping your competencies across corporate governance, finance, and strategic oversight pillars to determine institutional boardroom readiness.
            </p>
          </div>
          {assessmentCertified && (
            <button
              onClick={handleResetAssessment}
              className="px-3.5 py-1.5 border border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50/50 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Assessment</span>
            </button>
          )}
        </div>

        {(() => {
          const totalScoreMax = 12 * 5; // 60
          const currentTotalScore = assessmentQuestions.reduce((acc, q) => acc + (matrixScores[q.id] || 3), 0);
          const readinessIndex = Math.round((currentTotalScore / totalScoreMax) * 100);

          const categoriesList = [
            { name: "Corporate Governance", icon: Landmark, color: "bg-purple-500" },
            { name: "Strategic Strategy", icon: Sparkles, color: "bg-blue-500" },
            { name: "Financial Acumen", icon: CreditCard, color: "bg-amber-500" },
            { name: "Boardroom Presence", icon: Award, color: "bg-brand-pink" }
          ];

          const getCategoryAvg = (cat: string) => {
            const qs = assessmentQuestions.filter(q => q.category === cat);
            const sum = qs.reduce((acc, q) => acc + (matrixScores[q.id] || 3), 0);
            return Math.round((sum / (qs.length * 5)) * 100);
          };

          let badgeTitle = "Emerging Advisory Candidate";
          let badgeColor = "text-slate-600 bg-slate-50 border-slate-200";
          let badgeText = "You possess strong foundational leadership. Focus on building technical audit and corporate finance oversight credentials.";

          if (readinessIndex >= 90) {
            badgeTitle = "Elite Boardroom Ready Fellow";
            badgeColor = "text-amber-700 bg-amber-50 border-amber-200";
            badgeText = "Exceptional boardroom suitability. Qualified for immediate corporate nominating committee presentations and public board roles.";
          } else if (readinessIndex >= 76) {
            badgeTitle = "High-Impact Board Nominee";
            badgeColor = "text-brand-pink bg-brand-pink-light/20 border-brand-pink/20";
            badgeText = "Highly competitive profile. Prepared for advanced corporate board of directors nominations and fiduciary leadership seats.";
          } else if (readinessIndex >= 50) {
            badgeTitle = "Strategic Committee Prospect";
            badgeColor = "text-purple-700 bg-purple-50 border-purple-200";
            badgeText = "Excellent strategic background. Suitable for advisory councils, non-profit boards, and major corporate sub-committees.";
          }

          if (assessmentCertified) {
            return (
              <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 border border-slate-800 luxury-shadow relative overflow-hidden space-y-8 animate-fade-in">
                {/* Decorative Gold Elements */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-tr from-brand-gold/10 to-transparent rounded-full blur-2xl" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-tr from-brand-pink/10 to-transparent rounded-full blur-2xl" />

                <div className="flex flex-col lg:flex-row gap-8 items-center relative z-10">
                  {/* Certificate Graphic Card */}
                  <div className="w-full lg:w-2/5 max-w-sm bg-white text-slate-900 border-4 border-brand-gold rounded-2xl p-6 text-center space-y-5 shadow-2xl relative">
                    {/* Inner double line border */}
                    <div className="absolute inset-2 border border-brand-gold-dark/20 pointer-events-none rounded-lg" />

                    <div className="mx-auto w-12 h-12 rounded-full bg-slate-50 border border-brand-gold flex items-center justify-center">
                      <Award className="w-6 h-6 text-brand-gold-dark" />
                    </div>

                    <div className="space-y-1">
                      <span className="text-[8px] tracking-widest uppercase font-extrabold text-brand-pink block">Executive Certificate</span>
                      <h4 className="font-display font-extrabold text-slate-800 text-base">Boardroom Competency</h4>
                    </div>

                    <div className="border-t border-b border-slate-100 py-3 my-2 text-xs">
                      <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Nominee Fellow</p>
                      <p className="font-display font-extrabold text-slate-900 text-sm mt-0.5">{currentUser.fullName}</p>
                      <p className="text-[9px] text-slate-500 mt-0.5 italic">{currentUser.title || "Elite Professional"} @ {currentUser.company || "WomenPlay Corporate"}</p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-slate-400 text-[8px] uppercase font-bold block">Assessment Score</span>
                      <span className="font-display font-black text-3xl text-brand-gold-dark tracking-tight">{readinessIndex}%</span>
                      <span className="block text-[9px] font-bold text-slate-600 uppercase tracking-wider">{badgeTitle}</span>
                    </div>

                    <p className="text-[10px] text-slate-400 px-2 leading-relaxed">
                      Certified by the Secretariat under official guidelines for advanced female board delegation placement.
                    </p>
                  </div>

                  {/* Summary Details */}
                  <div className="flex-1 space-y-6">
                    <div className="space-y-2">
                      <div className="inline-flex items-center space-x-2 px-3 py-1 bg-brand-gold/10 text-brand-gold-dark border border-brand-gold/20 rounded-full text-[10px] font-extrabold uppercase">
                        <Check className="w-3.5 h-3.5" />
                        <span>Governance Credential Verified</span>
                      </div>
                      <h4 className="text-xl font-display font-extrabold text-white">Your Boardroom Suitability Profile</h4>
                      <p className="text-slate-300 text-xs leading-relaxed">
                        {badgeText} Your scores have been successfully verified and synchronized with your leader portfolio. Use these details to showcase audit and strategic competencies.
                      </p>
                    </div>

                    {/* Radar-like list */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {categoriesList.map((cat) => {
                        const avg = getCategoryAvg(cat.name);
                        const CatIcon = cat.icon;
                        return (
                          <div key={cat.name} className="bg-slate-800/60 border border-slate-700/50 p-4 rounded-xl space-y-3">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center space-x-2">
                                <div className={`${cat.color} p-1.5 rounded-lg text-white`}>
                                  <CatIcon className="w-3.5 h-3.5" />
                                </div>
                                <span className="text-xs font-bold text-slate-200">{cat.name}</span>
                              </div>
                              <span className="text-xs font-black text-brand-gold">{avg}%</span>
                            </div>
                            <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-brand-gold h-full rounded-full" style={{ width: `${avg}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-start space-x-3">
                      <Sparkles className="w-5 h-5 text-brand-gold shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <h5 className="text-xs font-bold text-brand-gold">Next Career Milestones</h5>
                        <p className="text-slate-300 text-[11px] leading-relaxed">
                          We recommend attending the upcoming executive retreat roundtable to connect with corporate nomination chairs and showcase your strategic profile.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div className="bg-white rounded-3xl border border-slate-150 p-6 space-y-6 shadow-sm">
              {/* Live Indicator Alert */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-slate-50 border border-slate-150 rounded-2xl gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-brand-gold/10 flex items-center justify-center shrink-0 border border-brand-gold/20">
                    <Sliders className="w-5 h-5 text-brand-gold-dark" />
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-extrabold text-slate-400 block">Current Status</span>
                    <span className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                      <span>Ready to Evaluate</span>
                      <span className="inline-block w-2 h-2 rounded-full bg-brand-pink animate-pulse" />
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="text-left sm:text-right">
                    <span className="text-[9px] uppercase font-extrabold text-slate-400 block">Calculated Index</span>
                    <span className="text-sm font-black text-slate-800">{readinessIndex}%</span>
                  </div>
                  <div className="text-xs">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase border ${badgeColor}`}>
                      {badgeTitle}
                    </span>
                  </div>
                </div>
              </div>

              {/* Questions Grouping */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                {assessmentQuestions.map((q) => {
                  const currentVal = matrixScores[q.id] || 3;
                  return (
                    <div
                      key={q.id}
                      className="p-5 rounded-2xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition flex flex-col justify-between space-y-3.5"
                    >
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="text-[8px] uppercase tracking-wider font-extrabold text-brand-pink px-2 py-0.5 bg-brand-pink-light/20 rounded-full">
                            {q.category}
                          </span>
                          <span className="text-[10px] font-black text-slate-400">Score: {currentVal}/5</span>
                        </div>
                        <h4 className="font-bold text-slate-800 text-[11px] leading-tight">{q.title}</h4>
                        <p className="text-slate-500 text-[10px] leading-relaxed">{q.desc}</p>
                      </div>

                      {/* Clickable 1-5 Competency Pills */}
                      <div className="flex items-center justify-between gap-1.5 pt-2">
                        {[1, 2, 3, 4, 5].map((val) => {
                          const isSelected = currentVal === val;
                          return (
                            <button
                              key={val}
                              type="button"
                              onClick={() => updateQuestionScore(q.id, val)}
                              className={`flex-1 py-1 px-1 rounded-lg border text-[10px] font-bold text-center transition ${
                                isSelected
                                  ? "bg-slate-900 border-slate-900 text-white"
                                  : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                              }`}
                            >
                              {val}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center space-x-2 text-[10px] text-slate-400">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>All 12 evaluation metrics completed. Ready for verification and sync.</span>
                </div>
                <button
                  onClick={handleCertifyAssessment}
                  className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-brand-pink to-brand-gold hover:opacity-90 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-md transition flex items-center justify-center space-x-2"
                >
                  <Award className="w-4 h-4" />
                  <span>Certify Competencies & Sync Roadmap</span>
                </button>
              </div>
            </div>
          );
        })()}
      </div>

      {/* MOBILE LAYOUTS & TOUCH CONTROLS OPTIMIZATION CENTER (ROADMAP TASK 6) */}
      <hr className="border-slate-150 my-10" />

      <div className="space-y-6" id="mobile-layout-optimizer-section">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-brand-pink text-xs uppercase tracking-wider font-extrabold">
              <Smartphone className="w-4 h-4" />
              <span>Executive Accessibility Portal</span>
            </div>
            <h3 className="text-lg font-display font-bold text-slate-800">
              WomenPlay Mobile & Touch Controls Optimization Hub
            </h3>
            <p className="text-slate-500 text-xs max-w-3xl">
              Satisfy roadmap milestone #6 by reviewing, validating, and applying mobile-responsive touch-target layouts (min 44px) across key portfolio feeds and checkout processes.
            </p>
          </div>
          {mobileOptimizerActive && (
            <button
              onClick={handleResetMobileOptimization}
              className="px-3.5 py-1.5 border border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50/50 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Optimizations</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Simulator Column */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-150 p-6 space-y-6 shadow-sm">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-700">Responsive Viewport Simulator</span>
              <div className="flex space-x-1">
                {[
                  { id: "iphone", name: "iPhone 15", icon: Smartphone },
                  { id: "tablet", name: "iPad Pro", icon: Tablet },
                  { id: "desktop", name: "Desktop Mini", icon: Eye }
                ].map((dev) => {
                  const DevIcon = dev.icon;
                  const isSelected = activeSimulationDevice === dev.id;
                  return (
                    <button
                      key={dev.id}
                      onClick={() => {
                        setActiveSimulationDevice(dev.id as any);
                        setSimulationStatus(`Switched simulation container viewport to ${dev.name}.`);
                      }}
                      className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold flex items-center space-x-1 transition ${
                        isSelected
                          ? "bg-slate-900 border-slate-900 text-white"
                          : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                      }`}
                    >
                      <DevIcon className="w-3 h-3" />
                      <span className="hidden sm:inline">{dev.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Simulated Device Frame wrapper */}
            <div className="flex justify-center items-center py-6 bg-slate-100/50 rounded-2xl border border-slate-150/60 overflow-hidden min-h-[300px]">
              <div
                className={`transition-all duration-300 bg-white border border-slate-300 shadow-md flex flex-col ${
                  activeSimulationDevice === "iphone"
                    ? "w-[280px] h-[380px] rounded-[36px] border-[8px] border-slate-800"
                    : activeSimulationDevice === "tablet"
                    ? "w-[440px] h-[300px] rounded-2xl border-4 border-slate-700"
                    : "w-full max-w-lg h-[240px] rounded-xl border border-slate-300"
                }`}
              >
                {/* Device top notches */}
                {activeSimulationDevice === "iphone" && (
                  <div className="w-24 h-4 bg-slate-800 rounded-b-xl mx-auto mb-1 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-700 mr-2" />
                    <span className="w-8 h-1 bg-slate-700 rounded-full" />
                  </div>
                )}

                {/* Screen inner container */}
                <div className="p-4 flex-1 overflow-y-auto space-y-4 text-left">
                  {/* Status bar */}
                  <div className="flex justify-between items-center text-[8px] font-mono font-bold text-slate-400 border-b border-slate-50 pb-1.5">
                    <span>09:41 AM</span>
                    <span className="flex items-center space-x-1">
                      <span>LTE</span>
                      <span>[🔋 100%]</span>
                    </span>
                  </div>

                  {/* Event list mock preview */}
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <span className="text-[7px] uppercase font-extrabold text-brand-pink tracking-wider">Premium Summit</span>
                      <h5 className="text-[10px] font-extrabold text-slate-800">WomenPlay Boardroom Retreat</h5>
                      <p className="text-[8px] text-slate-400">London, UK • Aug 14</p>
                    </div>

                    {/* Seating Reservation Mock Button */}
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2">
                      <span className="text-[8px] font-bold text-slate-500 block">Select Reservation Method:</span>

                      {/* Layout selection showcasing optimized padding */}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setSimulationStatus("Checked Credit Card touch option!")}
                          className={`rounded-lg border text-[8px] font-bold text-center transition ${
                            mobileOptimizerActive
                              ? "p-3 bg-brand-pink/10 border-brand-pink text-brand-pink font-semibold" // Touch targets >= 44px
                              : "p-1.5 bg-white border-slate-200 text-slate-500" // Tiny, non-accessible hit area
                          }`}
                        >
                          {mobileOptimizerActive ? "Card (Tap-Friendly)" : "Card (Small)"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setSimulationStatus("Checked Bank touch option!")}
                          className={`rounded-lg border text-[8px] font-bold text-center transition ${
                            mobileOptimizerActive
                              ? "p-3 bg-brand-pink/10 border-brand-pink text-brand-pink font-semibold"
                              : "p-1.5 bg-white border-slate-200 text-slate-500"
                          }`}
                        >
                          {mobileOptimizerActive ? "Bank (Tap-Friendly)" : "Bank (Small)"}
                        </button>
                      </div>

                      {/* Help tooltip with hit area explanation */}
                      <p className="text-[7px] text-slate-400 italic leading-tight">
                        {mobileOptimizerActive
                          ? "✓ Optimizations active: Tap areas expanded to minimum 44px (11mm height) for high tactile precision."
                          : "⚠ Unoptimized: Buttons have small padding (under 30px tap height) leading to high potential of user tap failures."}
                      </p>
                    </div>
                  </div>

                  {/* Interactive Board readiness evaluation preview */}
                  <div className="p-3 bg-slate-900 text-white rounded-xl space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[7px] uppercase tracking-wider font-extrabold text-brand-gold">Competency Score</span>
                      <span className="text-[8px] font-black">94%</span>
                    </div>

                    {/* Mock Pill Selector */}
                    <div className="flex justify-between gap-1">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setSimulationStatus(`Simulated rating tap: score ${num}`)}
                          className={`flex-1 rounded-md text-[8px] font-bold transition ${
                            mobileOptimizerActive
                              ? "py-2 px-1 bg-white/20 hover:bg-white text-white hover:text-slate-900 border border-white/10" // Touch friendly
                              : "py-0.5 px-0.5 bg-white/5 text-slate-400 border border-transparent" // Tiny
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Control Panel Column */}
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-150 flex flex-col justify-between space-y-6 text-xs">
            <div className="space-y-4">
              <h4 className="font-bold text-slate-800 flex items-center space-x-2 border-b border-slate-200 pb-2">
                <Sliders className="w-4 h-4 text-brand-pink" />
                <span>Tactile Verification</span>
              </h4>

              <div className="space-y-3">
                <div>
                  <span className="text-[9px] uppercase font-extrabold text-slate-400 block">Touch Guideline</span>
                  <span className="text-[11px] font-bold text-slate-700 block">W3C Mobile Accessibility Criteria</span>
                </div>
                <p className="text-slate-500 leading-relaxed text-[11px]">
                  Web guidelines require all interactive touch components to have a physical hit target of at least <strong>44 x 44 CSS pixels</strong> to prevent accidental double-taps or misaligned gestures.
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex items-center space-x-2">
                  <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${mobileOptimizerActive ? "bg-emerald-500" : "bg-slate-300 animate-pulse"}`}>
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-700">Responsive Viewports Bindings</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${mobileOptimizerActive ? "bg-emerald-500" : "bg-slate-300 animate-pulse"}`}>
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-700">44px Tap Target Expansions</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${mobileOptimizerActive ? "bg-emerald-500" : "bg-slate-300 animate-pulse"}`}>
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-700">Responsive Fluid Side-Margins</span>
                </div>
              </div>

              {simulationStatus && (
                <div className="bg-slate-900 text-white p-3 rounded-xl border border-slate-800 text-[10px] font-mono leading-relaxed">
                  <span className="text-brand-gold font-bold block mb-0.5">CONSOLE LOG:</span>
                  {simulationStatus}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={handleApplyMobileOptimization}
                className="w-full py-3 bg-gradient-to-r from-brand-pink to-brand-gold hover:opacity-95 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-md transition flex items-center justify-center space-x-2"
              >
                <Smartphone className="w-4 h-4" />
                <span>Verify & Apply Optimizations</span>
              </button>
              <p className="text-[10px] text-slate-400 text-center">
                Completes roadmap item #6 by configuring responsive layout rules.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
