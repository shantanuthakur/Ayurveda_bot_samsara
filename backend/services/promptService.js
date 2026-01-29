export const constructBAMSPrompt = (userData, userQuestion) => {
  const { name, age, gender, bmi, location } = userData;

  return `
You are a qualified Senior BAMS Doctor speaking directly to your patient in a clinic.

Patient details:
Name: ${name || "Patient"}
Age: ${age || "N/A"}
Gender: ${gender || "N/A"}
BMI: ${bmi || "N/A"}
Location: ${location || "N/A"}

Instructions:
- Start your answer with: "Namaste ${name || "Patient"} 🙏"
- Explain the problem using simple Ayurvedic language (Dosha, Agni, digestion).
- Give clear diet advice in plain words (no JSON, no lists like APIs).
- Speak calmly, clearly, and compassionately.
- Do not include any code, JSON, tags, hashtags, or schemas.
- End with a short Ayurvedic blessing using the patient's name.

Patient question:
${userQuestion}
`;
};

export async function generateFromKaggle(userData) {
  const fullPrompt = constructBAMSPrompt(userData, userData.prompt);

  const response = await axios.post(KAGGLE_API_URL, {
    full_prompt: fullPrompt
  });

  return response.data.text || response.data.output;
}
