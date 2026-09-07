const priorityColors = {
  low: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  med: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  high: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

export default function TaskCard({ task, onEdit, onDelete, onMove }) {
  const isOverdue =
    task.dueDate && task.status !== "done" && new Date(task.dueDate) < new Date(new Date().toDateString());

  return (
    <div
      className={`rounded-lg border bg-white p-3 shadow-sm dark:bg-gray-900 ${
        isOverdue ? "border-red-400" : "border-gray-200 dark:border-gray-800"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-semibold">{task.title}</h4>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${priorityColors[task.priority]}`}>
          {task.priority}
        </span>
      </div>
      {task.description && (
        <p className="mt-1 line-clamp-2 text-xs text-gray-500">{task.description}</p>
      )}
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
        {task.dueDate && (
          <span className={isOverdue ? "font-semibold text-red-500" : ""}>
            Due {new Date(task.dueDate).toLocaleDateString()}
            {isOverdue ? " (overdue)" : ""}
          </span>
        )}
        {task.estimatedEffort && (
          <span className="rounded bg-brand-50 px-1.5 py-0.5 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
            Effort: {task.estimatedEffort}
          </span>
        )}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <select
          value={task.status}
          onChange={(e) => onMove(task._id, e.target.value)}
          className="rounded border border-gray-200 bg-transparent px-1.5 py-1 text-xs dark:border-gray-700"
        >
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>
        <button onClick={() => onEdit(task)} className="text-xs text-brand-600 hover:underline">
          Edit
        </button>
        <button onClick={() => onDelete(task._id)} className="text-xs text-red-500 hover:underline">
          Delete
        </button>
      </div>
    </div>
  );
}
