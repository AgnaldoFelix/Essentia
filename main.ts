// main.ts
import { GoogleGenerativeAI } from "@google/genai";

// ⚠️ Segurança: nunca exponha a chave em repositórios públicos
// Configure a variável de ambiente antes de rodar:
// Linux/macOS: export GEMINI_API_KEY="sua_chave"
// Windows PowerShell: $env:GEMINI_API_KEY = "sua_chave"
const apiKey = Deno.env.get("GEMINI_API_KEY");

if (!apiKey) {
  console.error("❌ Erro: GEMINI_API_KEY não configurada.");
  Deno.exit(1);
}

// Inicializa o cliente Gemini
const genAI = new GoogleGenerativeAI(apiKey);

async function main() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = "Explique de forma simples como funciona a inteligência artificial.";

    const result = await model.generateContent(prompt);

    // Exibe a resposta
    console.log("✅ Resposta do Gemini:\n");
    console.log(result.response.text());
  } catch (error) {
    console.error("Erro ao chamar Gemini:", error);
  }
}

await main();
