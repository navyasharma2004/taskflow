import { getAiEstimate } from "../utils/llm.js";

export const suggestEstimate = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, message: "Title is required" });
    }

    const suggestion = await getAiEstimate(title, description);
    res.json({ success: true, data: suggestion });
  } catch (err) {
    // Even on unexpected errors, never break the UX — return a fallback shape.
    res.json({
      success: true,
      data: {
        effort: "M",
        suggestedDueDate: null,
        reasoning: "Could not generate a suggestion right now.",
        source: "fallback",
      },
    });
  }
};
