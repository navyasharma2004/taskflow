import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    status: {
      type: String,
      enum: ["todo", "in-progress", "done"],
      default: "todo",
    },
    priority: {
      type: String,
      enum: ["low", "med", "high"],
      default: "med",
    },
    dueDate: { type: Date, default: null },
    estimatedEffort: { type: String, default: "" }, // e.g. "S", "M", "L" or "4h"
    aiReasoning: { type: String, default: "" },
    board: { type: mongoose.Schema.Types.ObjectId, ref: "Board", required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Task", taskSchema);
