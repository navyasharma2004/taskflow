import { Link } from "react-router-dom";

export default function BoardCard({ board, onDelete }) {
  return (
    <div className="group relative rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
      <Link to={`/boards/${board._id}`}>
        <h3 className="text-lg font-semibold">{board.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-gray-500">
          {board.description || "No description"}
        </p>
      </Link>
      <button
        onClick={() => onDelete(board._id)}
        className="absolute right-3 top-3 hidden text-xs text-red-500 hover:underline group-hover:block"
      >
        Delete
      </button>
    </div>
  );
}
