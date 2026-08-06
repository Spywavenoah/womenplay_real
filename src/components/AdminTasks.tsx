import React from "react";
import { 
  CheckCircle2, Clock, AlertCircle, Plus, Search, Filter, Trash2, Edit3, 
  User as UserIcon, CheckSquare, Calendar, ShieldCheck, Sparkles, RefreshCw, X, Loader2
} from "lucide-react";
import type { TaskItem, User, Volunteer } from "../types";
import { showConfirmDialog } from "../lib/swal";

interface AdminTasksProps {
  currentUser: User | null;
  members: User[];
  volunteers?: Volunteer[];
  tasks?: TaskItem[];
  onRefresh?: () => void;
}

export default function AdminTasks({ currentUser, members, volunteers = [], tasks: propTasks, onRefresh }: AdminTasksProps) {
  const [internalTasks, setInternalTasks] = React.useState<TaskItem[]>(propTasks || []);
  const [internalVolunteers, setInternalVolunteers] = React.useState<Volunteer[]>(volunteers || []);
  const [fetchingTasks, setFetchingTasks] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [successMsg, setSuccessMsg] = React.useState("");

  const loadTasks = async () => {
    setFetchingTasks(true);
    try {
      const res = await fetch("/api/tasks");
      if (res.ok) {
        const data = await res.json();
        setInternalTasks(data || []);
      }
    } catch (e) {
      console.error("Failed to load tasks", e);
    } finally {
      setFetchingTasks(false);
    }
  };

  const loadVolunteers = async () => {
    try {
      const res = await fetch("/api/volunteers");
      if (res.ok) {
        const data = await res.json();
        setInternalVolunteers(data || []);
      }
    } catch (e) {
      console.error("Failed to load volunteers", e);
    }
  };

  React.useEffect(() => {
    if (propTasks && propTasks.length > 0) {
      setInternalTasks(propTasks);
    } else {
      loadTasks();
    }
    if (volunteers && volunteers.length > 0) {
      setInternalVolunteers(volunteers);
    } else {
      loadVolunteers();
    }
  }, [propTasks, volunteers]);

  const handleRefresh = () => {
    loadTasks();
    loadVolunteers();
    if (onRefresh) onRefresh();
  };

  // Filters
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<"ALL" | "Pending" | "In Progress" | "Completed">("ALL");
  const [assigneeFilter, setAssigneeFilter] = React.useState<string>("ALL");

  // Create & Edit States
  const [isCreating, setIsCreating] = React.useState(false);
  const [editingTask, setEditingTask] = React.useState<TaskItem | null>(null);

  // Form State
  const [taskForm, setTaskForm] = React.useState({
    text: "",
    description: "",
    category: "Feature" as "Interface" | "Feature" | "Other" | "Administrative" | "Operations",
    priority: "Medium" as "High" | "Medium" | "Low",
    assignedToUserId: "ALL",
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    status: "Pending" as "Pending" | "In Progress" | "Completed" | "Blocked"
  });

  const resetForm = () => {
    setTaskForm({
      text: "",
      description: "",
      category: "Feature",
      priority: "Medium",
      assignedToUserId: "ALL",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: "Pending"
    });
    setIsCreating(false);
    setEditingTask(null);
  };

  const resolveAssignee = (userId: string) => {
    if (userId === "ALL") {
      return { fullName: "All Network Members & Volunteers", email: "" };
    }
    const member = members.find(m => m.id === userId);
    if (member) {
      return { fullName: member.fullName, email: member.email };
    }
    const volunteer = internalVolunteers.find(v => v.userId === userId || v.id === userId);
    if (volunteer) {
      return { fullName: volunteer.fullName, email: volunteer.email };
    }
    return { fullName: "Unassigned", email: "" };
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    const assignee = resolveAssignee(taskForm.assignedToUserId);

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: taskForm.text,
          description: taskForm.description,
          category: taskForm.category,
          priority: taskForm.priority,
          assignedToUserId: taskForm.assignedToUserId,
          assignedToFullName: assignee.fullName,
          assignedToEmail: assignee.email,
          createdById: currentUser?.id || "admin",
          createdByName: currentUser?.fullName || "Administrator",
          dueDate: taskForm.dueDate,
          status: taskForm.status,
          completed: taskForm.status === "Completed"
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg("Task assigned successfully!");
        handleRefresh();
        resetForm();
      } else {
        setError(data.error || "Failed to create task.");
      }
    } catch (err) {
      setError("Server communication error.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;
    setLoading(true);
    setError("");
    setSuccessMsg("");

    const assignee = resolveAssignee(taskForm.assignedToUserId);

    try {
      const res = await fetch(`/api/tasks/${editingTask.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: taskForm.text,
          description: taskForm.description,
          category: taskForm.category,
          priority: taskForm.priority,
          assignedToUserId: taskForm.assignedToUserId,
          assignedToFullName: assignee.fullName,
          assignedToEmail: assignee.email,
          dueDate: taskForm.dueDate,
          status: taskForm.status,
          completed: taskForm.status === "Completed"
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg("Task details updated!");
        handleRefresh();
        resetForm();
      } else {
        setError(data.error || "Failed to update task.");
      }
    } catch (err) {
      setError("Server communication error.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (id: string) => {
    const confirmed = await showConfirmDialog("Delete Assigned Task?", "Are you sure you want to delete this assigned task?", "Yes, Delete Task");
    if (!confirmed) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSuccessMsg("Task removed permanently.");
        handleRefresh();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to delete task.");
      }
    } catch (err) {
      setError("Server connection error.");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (t: TaskItem) => {
    setEditingTask(t);
    setTaskForm({
      text: t.text,
      description: t.description || "",
      category: t.category as any,
      priority: t.priority,
      assignedToUserId: t.assignedToUserId || "ALL",
      dueDate: t.dueDate || new Date().toISOString().split("T")[0],
      status: (t.status as any) || (t.completed ? "Completed" : "Pending")
    });
    setIsCreating(false);
  };

  const filteredTasks = internalTasks.filter(t => {
    const matchSearch = t.text.toLowerCase().includes(search.toLowerCase()) || 
                        (t.description && t.description.toLowerCase().includes(search.toLowerCase())) ||
                        (t.assignedToFullName && t.assignedToFullName.toLowerCase().includes(search.toLowerCase()));
    
    const taskStatus = t.status || (t.completed ? "Completed" : "Pending");
    const matchStatus = statusFilter === "ALL" || taskStatus === statusFilter;

    const matchAssignee = assigneeFilter === "ALL" || t.assignedToUserId === assigneeFilter;

    return matchSearch && matchStatus && matchAssignee;
  });

  return (
    <div className="space-y-6 text-left" id="panel-admin-tasks">
      {/* Alert Banners */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl font-semibold text-xs flex items-center justify-between shadow-xs">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg("")} className="text-emerald-500 hover:text-emerald-700 font-bold">×</button>
        </div>
      )}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl font-semibold text-xs flex items-center justify-between shadow-xs">
          <span className="flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            {error}
          </span>
          <button onClick={() => setError("")} className="text-rose-500 hover:text-rose-700 font-bold">×</button>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-100 luxury-shadow">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-brand-pink" />
            <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Executive Task Management & Assignments</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">Assign, monitor, and audit strategic goals assigned to specific fellows, platform members, and volunteers.</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsCreating(true);
          }}
          className="py-2 px-4 bg-brand-pink text-white rounded-xl font-bold text-xs hover:bg-brand-pink-dark flex items-center gap-1.5 transition shadow-sm cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Assign New Task</span>
        </button>
      </div>

      {/* Create / Edit Modal Form Overlay */}
      {(isCreating || editingTask) && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 luxury-shadow space-y-4 animate-in slide-in-from-top-4 duration-200">
          <div className="flex justify-between items-center border-b border-slate-150 pb-3">
            <h3 className="text-xs font-black uppercase text-slate-800 flex items-center gap-1.5">
              <CheckSquare className="w-4 h-4 text-brand-pink" />
              <span>{editingTask ? "Update Assigned Task" : "Assign New Task to Member / Volunteer"}</span>
            </h3>
            <button onClick={resetForm} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={editingTask ? handleUpdateTask : handleCreateTask} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Task Title / Headline *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Complete Q3 Boardroom Compliance Review"
                  value={taskForm.text}
                  onChange={(e) => setTaskForm({ ...taskForm, text: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-pink text-slate-800 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Assign To Member / Volunteer *</label>
                <select
                  value={taskForm.assignedToUserId}
                  onChange={(e) => setTaskForm({ ...taskForm, assignedToUserId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-pink text-slate-800 font-medium"
                >
                  <option value="ALL">🌐 All Network Members & Volunteers (Global Assignment)</option>
                  <optgroup label="👤 Network Members">
                    {members.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.fullName} ({m.email}) — Tier: {m.membershipTier}
                      </option>
                    ))}
                  </optgroup>
                  {internalVolunteers.length > 0 && (
                    <optgroup label="🤝 Volunteers">
                      {internalVolunteers.map(v => (
                        <option key={v.id} value={v.userId || v.id}>
                          {v.fullName} ({v.email}) — Volunteer
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Detailed Action Items & Description</label>
              <textarea
                rows={3}
                placeholder="Provide explicit instructions, requirements, or deliverables for the assigned fellow..."
                value={taskForm.description}
                onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-pink text-slate-800 font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Category</label>
                <select
                  value={taskForm.category}
                  onChange={(e: any) => setTaskForm({ ...taskForm, category: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs"
                >
                  <option value="Feature">Feature</option>
                  <option value="Interface">Interface</option>
                  <option value="Administrative">Administrative</option>
                  <option value="Operations">Operations</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Priority Level</label>
                <select
                  value={taskForm.priority}
                  onChange={(e: any) => setTaskForm({ ...taskForm, priority: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs"
                >
                  <option value="High">🔴 High Priority</option>
                  <option value="Medium">🟡 Medium Priority</option>
                  <option value="Low">🟢 Low Priority</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Execution Status</label>
                <select
                  value={taskForm.status}
                  onChange={(e: any) => setTaskForm({ ...taskForm, status: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Blocked">Blocked</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Due Date</label>
                <input
                  type="date"
                  value={taskForm.dueDate}
                  onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs font-mono"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2 justify-end">
              <button
                type="button"
                onClick={resetForm}
                className="py-2 px-4 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="py-2 px-5 bg-brand-pink hover:bg-brand-pink-dark text-white rounded-xl font-bold transition flex items-center gap-1.5"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                <span>{editingTask ? "Save Task Changes" : "Confirm Task Assignment"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-150 flex flex-wrap gap-4 items-center justify-between">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search tasks, descriptions, assignees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-pink"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e: any) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl font-semibold text-slate-700"
          >
            <option value="ALL">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>

          {/* Member / Volunteer Filter */}
          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl font-semibold text-slate-700"
          >
            <option value="ALL">All Assignees</option>
            {members.map(m => (
              <option key={m.id} value={m.id}>{m.fullName}</option>
            ))}
            {internalVolunteers.map(v => (
              <option key={v.id} value={v.userId || v.id}>{v.fullName} (Volunteer)</option>
            ))}
          </select>

          <button
            onClick={onRefresh}
            className="p-1.5 text-slate-500 hover:text-slate-800 rounded-xl border border-slate-200 hover:bg-slate-50 transition"
            title="Refresh tasks"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Task List Ledger */}
      <div className="bg-white rounded-2xl border border-slate-100 luxury-shadow overflow-hidden">
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <CheckSquare className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-semibold">No assigned tasks match your query filters.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredTasks.map((t) => {
              const isCompleted = t.completed || t.status === "Completed";
              const priorityBg = t.priority === "High" ? "bg-rose-50 text-rose-700 border-rose-200" :
                                 t.priority === "Medium" ? "bg-amber-50 text-amber-800 border-amber-200" :
                                 "bg-emerald-50 text-emerald-800 border-emerald-200";

              return (
                <div key={t.id} className="p-5 hover:bg-slate-50/50 transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase border ${priorityBg}`}>
                        {t.priority} Priority
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase bg-slate-100 text-slate-600 border border-slate-200">
                        {t.category}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase ${
                        isCompleted ? "bg-emerald-100 text-emerald-800" : "bg-blue-50 text-blue-800 border border-blue-200"
                      }`}>
                        Status: {t.status || (isCompleted ? "Completed" : "Pending")}
                      </span>
                    </div>

                    <h4 className={`text-sm font-bold text-slate-800 ${isCompleted ? "line-through text-slate-400" : ""}`}>
                      {t.text}
                    </h4>

                    {t.description && (
                      <p className="text-xs text-slate-500 line-clamp-2">{t.description}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-[10px] text-slate-400 pt-1">
                      <span className="flex items-center gap-1 font-semibold text-slate-600">
                        <UserIcon className="w-3 h-3 text-brand-pink" />
                        Assigned To: <strong className="text-slate-800">{t.assignedToFullName || "All Members"}</strong>
                      </span>
                      {t.dueDate && (
                        <span className="flex items-center gap-1 font-mono">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          Due: {t.dueDate}
                        </span>
                      )}
                      {t.createdByName && (
                        <span>By Admin: {t.createdByName}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    <button
                      onClick={() => startEdit(t)}
                      className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                      title="Edit task"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTask(t.id)}
                      className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                      title="Delete task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
