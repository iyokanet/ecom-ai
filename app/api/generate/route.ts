import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Vercel panelinde GEMINI_API_KEY bulunamadı.' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const { imageBase64, mimeType } = await req.json();

    if (!imageBase64 || !mimeType) {
      return NextResponse.json({ error: 'Görsel yüklenmedi.' }, { status: 400 });
    }

    // Google AI Studio Flash Modeli Entegrasyonu
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: 'application/json' },
    });

    const prompt = `
      Sen e-ticaret pazaryerleri (Trendyol, Amazon, HepsiBurada) için çalışan uzman bir metin yazarısın. 
      Yüklenen görseldeki ürünü analiz et ve strictly JSON formatında şu yanıtı dön:
      {
        "title": "Ürün için SEO uyumlu, dikkat çekici başlık",
        "description": "• Maddeler halinde 4 önemli pazarlama özelliği"
      }
    `;

    const cleanBase64 = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: cleanBase64,
          mimeType: mimeType,
        },
      },
    ]);

    const responseText = result.response.text();
    return NextResponse.json(JSON.parse(responseText));
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Gemini API bağlantı hatası.' },
      { status: 500 }
    );
  }
}
