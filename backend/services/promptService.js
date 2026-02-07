import axios from "axios";
import fs from "fs";


const KAGGLE_API_URL =
  "https://nonzonated-victoria-hilariously.ngrok-free.dev/generate";

export const constructBAMSPrompt = (userData, userQuestion) => {
  const {
    name,
    age,
    gender,
    bmi,
    location,
    dosha,
    bodyType,
    chronicDisease
  } = userData;

  return `
You are a qualified Senior BAMS Doctor (Ayurvedacharya) giving a real clinical consultation.

Patient profile:
Name: ${name || "Patient"}
Age: ${age || "N/A"} years
Gender: ${gender || "N/A"}
BMI: ${bmi || "N/A"}
Location: ${location || "N/A"}
Dosha: ${dosha || "Unknown"}
Body Type: ${bodyType || "Unknown"}
Chronic Disease: ${chronicDisease || "None"}

CRITICAL OUTPUT FORMAT RULES - READ CAREFULLY:
❌ NEVER output JSON, code blocks, or structured data formats
❌ NEVER include metadata like "User Input:", "Output:", or field labels
❌ NEVER use curly braces {}, square brackets [], or angle brackets <>
❌ NEVER use hashtags, asterisks for headers, or markdown formatting
❌ NEVER include system tokens like </s>, [/INST], or similar
✅ ONLY write natural, conversational sentences in plain text
✅ Write EXACTLY as if speaking directly to the patient in person
✅ Your response must look like a doctor's verbal advice, nothing else

VERY IMPORTANT CLINICAL RULES:
1. Start the response exactly with: Namaste ${name || "Patient"} 🙏
2. Address the patient by name at least two times.
3. Answer ONLY based on the symptoms mentioned by the patient.
4. DO NOT add, assume, or invent new symptoms or diseases.
5. Keep the explanation simple if the complaint is mild (fatigue, body pain, bloating).
6. Use Ayurvedic concepts (Vata, Pitta, Kapha, Agni) only when relevant.
7. Give diet advice in simple, natural language (no tables, no JSON).
8. Do not use code, hashtags, brackets, special symbols, or dataset-style text.
9. Do not mention modern or allopathic medicine.
10. End with a short Ayurvedic blessing using the patient's name.

Tone:
Calm, reassuring, practical, like a real Ayurvedic doctor speaking to a patient.

Patient question:
${userQuestion}

Remember: Respond ONLY in natural conversational text. No JSON, no metadata, no formatting codes.`;
};

/**
 * Clean the LLM response to remove JSON metadata and formatting artifacts
 */
function cleanResponse(rawText) {
  if (!rawText) return "";

  let cleaned = rawText;

  // STRATEGY 1: Anchor to "Namaste"
  // The prompt enforces starting with "Namaste", so we can discard everything before it.
  const namasteIndex = cleaned.search(/Namaste/i);
  if (namasteIndex !== -1) {
    cleaned = cleaned.substring(namasteIndex);
  }

  // STRATEGY 2: Remove JSON objects and metadata labels
  // Remove "User Input:" followed by anything
  cleaned = cleaned.replace(/User Input:\s*\{[^}]*\}/gi, "");
  cleaned = cleaned.replace(/User Input:[^\n]*/gi, "");

  // Remove standalone JSON objects at the start
  cleaned = cleaned.replace(/^\s*\{[^}]*\}\s*/g, "");

  // Remove "Output:" labels
  cleaned = cleaned.replace(/Output:\s*/gi, "");
  cleaned = cleaned.replace(/Response:\s*/gi, "");

  // Remove any JSON blocks with curly braces
  cleaned = cleaned.replace(/\{[^{}]*:.*?\}/g, "");

  // STRATEGY 3: Remove code blocks
  cleaned = cleaned.replace(/```json\n[\s\S]*?```/g, "");
  cleaned = cleaned.replace(/```[\s\S]*?```/g, "");

  // STRATEGY 4: Remove common end tokens
  cleaned = cleaned.replace(/<\/s>/g, "");
  cleaned = cleaned.replace(/\[\/INST\]/g, "");
  cleaned = cleaned.replace(/<\|end\|>/g, "");
  cleaned = cleaned.replace(/<\|endoftext\|>/g, "");

  // STRATEGY 5: Remove hashtags (except in emojis context)
  cleaned = cleaned.replace(/#+\s/g, "");

  return cleaned.trim();
}

export async function generateFromKaggle(userData) {
  const fullPrompt = constructBAMSPrompt(userData, userData.prompt);

  const response = await axios.post(KAGGLE_API_URL, {
    full_prompt: fullPrompt
  });

  const rawResponse = response.data.text || response.data.output;

  // DEBUG LOGGING
  try {
    const logEntry = `\n\n--- DATE: ${new Date().toISOString()} ---\nRAW RESPONSE:\n${rawResponse}\n----------------\n`;
    fs.appendFileSync("raw_response_log.txt", logEntry);
  } catch (err) {
    console.error("Logging failed:", err);
  }

  return cleanResponse(rawResponse);
}
