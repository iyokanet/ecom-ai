import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const rawApiKey = process.env.GEMINI_API_KEY || '';
    const apiKey = rawApiKey.replace(/[^\x00-\x7F]/g, '').trim();

    if (!apiKey) {
      return NextResponse.json({ error: 'Vercel panelinde GEMINI_API_KEY bulunamadı.' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const { imageBase64, mimeType } = await req.json();

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: 'application/json' },
    });

    const prompt = `
      Sen e-ticaret uzmanısın. Görseldeki ürünü analiz et ve strictly JSON yanıtı ver:
      {
        "title": "SEO Uyumlu Ürün Başlığı",
        "description": "• Maddeli Pazarlama Açıklaması"
      }
    `;

    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: cleanBase64, mimeType: mimeType } },
    ]);

    return NextResponse.json(JSON.parse(result.response.text()));
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'API Hatası' }, { status: 500 });
  }
}
