const { GoogleGenerativeAI } = require('@google/generative-ai');

// Ambil API Key dari environment variable
const apiKey = process.env.GEMINI_API_KEY;

// Inisialisasi SDK Gemini
const genAI = new GoogleGenerativeAI(apiKey);

async function analyzeTicket(content) {
  // Kita gunakan model gemini-1.5-flash karena sangat cepat untuk teks
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    // INI KUNCI ENGINEERING DEPTH: Memaksa Gemini hanya merespon valid JSON
    generationConfig: {
      responseMimeType: "application/json",
    }
  });

  // Prompt yang terstruktur
  const prompt = `
  Anda adalah Customer Support AI Triage Assistant. 
  Tugas Anda adalah menganalisis keluhan pelanggan berikut:
  "${content}"
  
  Keluarkan hasil evaluasi Anda dalam format JSON persis seperti skema di bawah ini:
  {
    "category": "String. Wajib pilih salah satu: Billing, Technical, Feature Request",
    "sentiment": "Number. Skala 1 sampai 10 (1 = sangat marah, 10 = sangat senang)",
    "urgency": "String. Wajib pilih salah satu: High, Medium, Low. (Jika marah/kritis, pilih High)",
    "replyDraft": "String. Buat draft balasan yang profesional, sopan, dan memberikan solusi awal."
  }
  `;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Karena kita sudah pakai responseMimeType, ini dijamin JSON murni
    const parsedData = JSON.parse(responseText);
    
    return parsedData;
  } catch (error) {
    console.error("Gagal saat memanggil Gemini AI:", error);
    // Lemparkan error agar ditangkap oleh Worker dan status tiket jadi FAILED
    throw new Error("AI Processing Failed"); 
  }
}

module.exports = { analyzeTicket };