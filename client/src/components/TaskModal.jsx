import { useEffect, useState } from "react";
import api from "../api/axios.js";

const emptyForm = {
  title: "",
  description: "",
  status: "todo",
  priority: "med",
  dueDate: "",
  estimatedEffort: "",
};

export default function TaskModal({ boardId, task, onClose, onSaved }) {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [aiError, setAiError] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || "",
        description: task.description || "",
        status: task.status || "todo",
        priority: task.priority || "med",
        dueDate: task.dueDate ? task.dueDate.slice(0, 10) : "",
        estimatedEffort: task.estimatedEffort || "",
      });
    } else {
      setForm(emptyForm);
    }
  }, [task]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSuggest = async () => {
    if (!form.title.trim()) {
      setAiError("Add a title first so AI has something to estimate.");
      return;
    }
    setAiLoading(true);
    setAiError("");
    try {
      const res = await api.post("/ai/suggest-estimate", {
        title: form.title,
        description: form.description,
      });
      setAiSuggestion(res.data.data);
    } catch (err) {
      setAiError("Couldn't reach the AI estimator. You can still set values manually.");
    } finally {
      setAiLoading(false);
    }
  };

  const applySuggestion = () => {
    if (!aiSuggestion) return;
    setForm({
      ...form,
      estimatedEffort: aiSuggestion.effort || form.estimatedEffort,
      dueDate: aiSuggestion.suggestedDueDate || form.dueDate,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("Title is required");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = { ...form, board: boardId };
      if (task) {
        await api.put(`/tasks/${task._id}`, payload);
      } else {
        await api.post("/tasks", payload);
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
        <h2 className="mb-4 text-lg font-bold">{task ? "Edit Task" : "New Task"}</h2>
        {error && <p className="mb-3 text-sm text-red-500">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            name="title"
            placeholder="Task title"
            value={form.title}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm dark:border-gray-700"
          />
          <textarea
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            className="w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm dark:border-gray-700"
          />
          <div className="grid grid-cols-2 gap-3">
            <select
              name="priority"
              value={form.priority}
              onChange={handleChange}
              className="rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm dark:border-gray-700"
            >
              <option value="low">Low</option>
              <option value="med">Medium</option>
              <option value="high">High</option>
            </select>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm dark:border-gray-700"
            >
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="date"
              name="dueDate"
              value={form.dueDate}
              onChange={handleChange}
              className="rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm dark:border-gray-700"
            />
            <input
              name="estimatedEffort"
              placeholder="Effort (e.g. S/M/L)"
              value={form.estimatedEffort}
              onChange={handleChange}
              className="rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm dark:border-gray-700"
            />
          </div>

          <div className="rounded-md border border-dashed border-brand-300 p-3 dark:border-brand-700">
            <button
              type="button"
              onClick={handleSuggest}
              disabled={aiLoading}
              className="text-sm font-medium text-brand-600 hover:underline disabled:opacity-50"
            >
              {aiLoading ? "Thinking..." : "✨ Suggest estimate (AI)"}
            </button>
            {aiError && <p className="mt-1 text-xs text-red-500">{aiError}</p>}
            {aiSuggestion && (
              <div className="mt-2 text-xs text-gray-600 dark:text-gray-300">
                <p>
                  Suggested effort: <strong>{aiSuggestion.effort}</strong>, due{" "}
                  <strong>{aiSuggestion.suggestedDueDate || "n/a"}</strong>
                </p>
                <p className="italic">{aiSuggestion.reasoning}</p>
                {aiSuggestion.source === "fallback" && (
                  <p className="text-amber-600">(heuristic fallback — AI service unavailable)</p>
                )}
                <button
                  type="button"
                  onClick={applySuggestion}
                  className="mt-1 rounded bg-brand-600 px-2 py-1 text-xs font-medium text-white hover:bg-brand-700"
                >
                  Accept suggestion
                </button>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
