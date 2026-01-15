
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzeKitabImage = async (base64Image: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            { inlineData: { data: base64Image, mimeType: "image/jpeg" } },
            { text: "Analisis foto kitab pesantren ini. Identifikasi judul kitab yang tertera pada cover. Berikan detail dalam format JSON: name (judul kitab lengkap), category (Fiqh/Hadits/Tafsir/Aqidah/Nahwu/Tasawuf/Adab/Lainnya), description (deskripsi produk yang menarik untuk jualan di Shopee, sebutkan keunggulan cetakan), price (estimasi harga eceran pasar dalam angka saja), wholesalePrice (80% dari harga eceran)." }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            category: { type: Type.STRING },
            description: { type: Type.STRING },
            price: { type: Type.NUMBER },
            wholesalePrice: { type: Type.NUMBER },
          },
          required: ["name", "category", "description", "price", "wholesalePrice"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return null;
  }
};
