import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios.js";
import Navbar from "../components/Navbar.jsx";
import TaskCard from "../components/TaskCard.jsx";
import TaskModal from "../components/TaskModal.jsx";

const COLUMNS = [
  { key: "todo", label: "To Do" },
  { key: "in-progress", label: "In Progress" },
  { key: "done", label: "Done" },
];

export default function BoardView() {
  const { id } = useParams();
  const [board, setBoard] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [priorityFilter, setPriorityFilter] = useState("");
  const [sort, setSort] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [boardRes, tasksRes] = await Promise.all([
        api.get(`/boards/${id}`),
        api.get("/tasks", { params: { boardId: id, priority: priorityFilter || undefined, sort: sort || undefined } }),
      ]);
      setBoard(boardRes.data.data);
      setTasks(tasksRes.data.data);
    } catch (err) {
      setError("Couldn't load board. It may not exist or you don't have access.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, priorityFilter, sort]);

  const handleMove = async (taskId, status) => {
    setTasks((prev) => prev.map((t) => (t._id === taskId ? { ...t, status } : t)));
    try {
      await api.put(`/tasks/${taskId}`, { status });
    } catch {
      loadData();
    }
  };

  const handleDelete = async (taskId) => {
    if (!confirm("Delete this task?")) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
    } catch {
      setError("Couldn't delete task");
    }
  };

  const openNewTask = () => {
    setEditingTask(null);
    setShowModal(true);
  };

  const openEditTask = (task) => {
    setEditingTask(task);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <p className="p-8 text-center text-gray-500">Loading board...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <p className="p-8 text-center text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link to="/dashboard" className="text-sm text-brand-600 hover:underline">
              ← Back to boards
            </Link>
            <h1 className="text-2xl font-bold">{board.title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="rounded-md border border-gray-300 bg-transparent px-2 py-1.5 text-sm dark:border-gray-700"
            >
              <option value="">All priorities</option>
              <option value="low">Low</option>
              <option value="med">Medium</option>
              <option value="high">High</option>
            </select>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-md border border-gray-300 bg-transparent px-2 py-1.5 text-sm dark:border-gray-700"
            >
              <option value="">Sort: Newest</option>
              <option value="dueDate">Sort: Due date</option>
              <option value="priority">Sort: Priority</option>
            </select>
            <button
              onClick={openNewTask}
              className="rounded-md bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
            >
              + New Task
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {COLUMNS.map((col) => (
            <div key={col.key} className="rounded-xl bg-gray-100 p-3 dark:bg-gray-900">
              <h2 className="mb-3 text-sm font-semibold uppercase text-gray-500">
                {col.label} ({tasks.filter((t) => t.status === col.key).length})
              </h2>
              <div className="space-y-3">
                {tasks
                  .filter((t) => t.status === col.key)
                  .map((task) => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      onEdit={openEditTask}
                      onDelete={handleDelete}
                      onMove={handleMove}
                    />
                  ))}
              </div>
            </div>
          ))}
        </div>
      </main>

      {showModal && (
        <TaskModal
          boardId={id}
          task={editingTask}
          onClose={() => setShowModal(false)}
          onSaved={() => {
            setShowModal(false);
            loadData();
          }}
        />
      )}
    </div>
  );
}
