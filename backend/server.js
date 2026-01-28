import express from "express";
import cors from "cors";
import { generateFromKaggle } from "./services/promptService.js";

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

app.post("/api/chat", async (req, res) => {
  try {
    const result = await generateFromKaggle(req.body);

    console.log(" LLM RAW RESPONSE:", result);

    if (!result || result.trim().length === 0) {
      return res.json({
        response: "⚠️ The model returned an empty response. Please try again."
      });
    }

    res.json({ response: result });
  } catch (error) {
    console.error(" Backend error:", error);
    res.status(500).json({
      response: " Server error while generating response"
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});
