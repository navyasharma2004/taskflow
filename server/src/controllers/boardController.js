import Board from "../models/Board.js";
import Task from "../models/Task.js";

export const getBoards = async (req, res) => {
  try {
    const boards = await Board.find({ owner: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, data: boards });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createBoard = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title) return res.status(400).json({ success: false, message: "Title is required" });

    const board = await Board.create({ title, description, owner: req.user.id });
    res.status(201).json({ success: true, data: board });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getBoard = async (req, res) => {
  try {
    const board = await Board.findOne({ _id: req.params.id, owner: req.user.id });
    if (!board) return res.status(404).json({ success: false, message: "Board not found" });
    res.json({ success: true, data: board });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateBoard = async (req, res) => {
  try {
    const board = await Board.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!board) return res.status(404).json({ success: false, message: "Board not found" });
    res.json({ success: true, data: board });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteBoard = async (req, res) => {
  try {
    const board = await Board.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
    if (!board) return res.status(404).json({ success: false, message: "Board not found" });
    await Task.deleteMany({ board: board._id, owner: req.user.id });
    res.json({ success: true, data: { id: board._id } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
