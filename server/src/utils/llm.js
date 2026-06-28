// Lightweight wrapper around the Google Gemini free-tier API.
// If GEMINI_API_KEY is missing, or the call fails/times out, we return a
// deterministic local fallback so the feature still "works" without AI.

const TIMEOUT_MS = 8000;

function localFallback(title = "", description = "") {
  const text = `${title} ${description}`.toLowerCase();
  let effort = "M";
  let days = 3;

  if (text.length < 30) {
    effort = "S";
    days = 1;
  } else if (text.length > 120 || /design|migrat|integrat|research/.test(text)) {
    effort = "L";
    days = 5;
  }

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + days);

  return {
    effort,
    suggestedDueDate: dueDate.toISOString().slice(0, 10),
    reasoning: "Fallback heuristic estimate (AI service unavailable or not configured).",
    source: "fallback",
  };
}

export async function getAiEstimate(title, description) {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";

  if (!apiKey) {
    return localFallback(title, description);
  }

  const prompt = `You are a project management assistant. Given a task title and description, estimate the effort and a reasonable due date.
Respond ONLY with valid JSON, no markdown, in this exact shape:
{"effort":"S|M|L","suggestedDueDate":"YYYY-MM-DD","reasoning":"one short sentence"}

Today's date is ${new Date().toISOString().slice(0, 10)}.
Task title: ${title}
Task description: ${description || "(none)"}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 200 },
        }),
      }
    );

    clearTimeout(timeout);

    if (!response.ok) {
      const errBody = await response.text().catch(() => "");
      console.error("Gemini API error:", response.status, errBody);
      return localFallback(title, description);
    }

    const data = await response.json();
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    if (!parsed.effort || !parsed.suggestedDueDate) {
      console.error("Gemini returned unexpected shape:", raw);
      return localFallback(title, description);
    }

    return { ...parsed, source: "gemini" };
  } catch (err) {
    clearTimeout(timeout);
    console.error("Gemini call failed:", err.message);
    return localFallback(title, description);
  }
}