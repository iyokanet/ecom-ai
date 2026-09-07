import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'GEMINI_API_KEY tanımlanmamış!' }, { status: 500 });
    }

    const { imageBase64, mimeType } = await req.json();

    if (!imageBase64 || !mimeType) {
      return NextResponse.json({ error: 'Görsel yüklenmedi' }, { status: 400 });
    }

    // Gemini Flash güncel model adı
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: 'application/json' } // Doğrudan JSON dönecek
    });

    const prompt = `
      Sen profesyonel bir e-ticaret uzmanısın. Yüklenen ürün görselini analiz et ve şu formatta yanıt ver:
      {
        "title": "SEO Uyumlu Ürün Başlığı",
        "description": "• Pazarlama Açıklaması Maddeleri"
      }
    `;

    const imagePart = {
      inlineData: {
        data: imageBase64.split(',')[1] || imageBase64,
        mimeType: mimeType,
      },
    };

    const result = await model.generateContent([prompt, imagePart]);
    const responseText = result.response.text();

    return NextResponse.json(JSON.parse(responseText));
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message || 'İçerik üretilemedi' }, { status: 500 });
  }
}
