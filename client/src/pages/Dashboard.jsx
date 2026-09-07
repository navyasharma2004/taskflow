import { useEffect, useState } from "react";
import api from "../api/axios.js";
import Navbar from "../components/Navbar.jsx";
import BoardCard from "../components/BoardCard.jsx";

export default function Dashboard() {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);

  const loadBoards = async () => {
    setLoading(true);
    try {
      const res = await api.get("/boards");
      setBoards(res.data.data);
    } catch (err) {
      setError("Couldn't load boards. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBoards();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setCreating(true);
    try {
      await api.post("/boards", { title, description });
      setTitle("");
      setDescription("");
      setShowForm(false);
      loadBoards();
    } catch (err) {
      setError("Couldn't create board");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this board and all its tasks?")) return;
    try {
      await api.delete(`/boards/${id}`);
      setBoards((prev) => prev.filter((b) => b._id !== id));
    } catch (err) {
      setError("Couldn't delete board");
    }
  };

  return (
    <div>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Your Boards</h1>
          <button
            onClick={() => setShowForm((s) => !s)}
            className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            {showForm ? "Cancel" : "+ New Board"}
          </button>
        </div>

        {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

        {showForm && (
          <form onSubmit={handleCreate} className="mb-6 flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900 sm:flex-row">
            <input
              placeholder="Board title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1 rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm dark:border-gray-700"
            />
            <input
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="flex-1 rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm dark:border-gray-700"
            />
            <button
              disabled={creating}
              className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {creating ? "Creating..." : "Create"}
            </button>
          </form>
        )}

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-800" />
            ))}
          </div>
        ) : boards.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center dark:border-gray-700">
            <p className="text-gray-500">No boards yet. Create your first one to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {boards.map((b) => (
              <BoardCard key={b._id} board={b} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
