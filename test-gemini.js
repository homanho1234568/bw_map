import { GoogleGenAI } from '@google/genai';
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function test() {
  try {
    const res = await ai.models.generateContent({ model: 'gemini-3.5-flash', contents: 'test' });
    console.log(res.text);
  } catch (e) {
    console.error("ERROR:");
    console.error(e.message);
  }
}
test();
