import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { imageBase64, mimeType } = await req.json();

    if (!imageBase64 || !mimeType) {
      return NextResponse.json({ error: 'Görsel yüklenmedi' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
      Sen profesyonel bir e-ticaret uzmanısın. Yüklenen ürün görselini analiz et ve:
      1. Trendyol, Hepsiburada ve Amazon için SEO uyumlu bir Ürün Başlığı üret.
      2. Müşteriyi ikna edecek 4 maddelik bir Pazarlama Açıklaması yaz.

      YALNIZCA geçerli bir JSON formatında yanıt ver:
      {
        "title": "Ürün Başlığı",
        "description": "• Pazarlama Açıklaması"
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
    const cleanedText = responseText.replace(/```json|```/g, '').trim();
    
    return NextResponse.json(JSON.parse(cleanedText));
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'İçerik üretilemedi' }, { status: 500 });
  }
}
