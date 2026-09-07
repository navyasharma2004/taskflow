import Task from "../models/Task.js";
import Board from "../models/Board.js";

const STATUSES = ["todo", "in-progress", "done"];
const PRIORITIES = ["low", "med", "high"];

export const getTasks = async (req, res) => {
  try {
    const { boardId, status, priority, sort } = req.query;
    const filter = { owner: req.user.id };
    if (boardId) filter.board = boardId;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    let query = Task.find(filter);

    if (sort === "dueDate") query = query.sort({ dueDate: 1 });
    else if (sort === "priority") query = query.sort({ priority: -1 });
    else query = query.sort({ createdAt: -1 });

    const tasks = await query;
    res.json({ success: true, data: tasks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, estimatedEffort, board } = req.body;

    if (!title || !board) {
      return res.status(400).json({ success: false, message: "Title and board are required" });
    }
    if (status && !STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }
    if (priority && !PRIORITIES.includes(priority)) {
      return res.status(400).json({ success: false, message: "Invalid priority" });
    }

    const boardDoc = await Board.findOne({ _id: board, owner: req.user.id });
    if (!boardDoc) return res.status(404).json({ success: false, message: "Board not found" });

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      dueDate,
      estimatedEffort,
      board,
      owner: req.user.id,
    });

    res.status(201).json({ success: true, data: task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    if (req.body.status && !STATUSES.includes(req.body.status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }
    if (req.body.priority && !PRIORITIES.includes(req.body.priority)) {
      return res.status(400).json({ success: false, message: "Invalid priority" });
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });
    res.json({ success: true, data: task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });
    res.json({ success: true, data: { id: task._id } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
