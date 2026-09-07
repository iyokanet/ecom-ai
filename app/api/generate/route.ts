import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'GEMINI_API_KEY bulunamadı! Vercel Environment Variables kısmını kontrol edin.' }, { status: 500 });
    }

    const { imageBase64, mimeType } = await req.json();

    if (!imageBase64 || !mimeType) {
      return NextResponse.json({ error: 'Görsel yüklenmedi' }, { status: 400 });
    }

    // Güncel Flash modeli
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash'
    });

    const prompt = `
      Sen profesyonel bir e-ticaret uzmanısın. Yüklenen ürün görselini analiz et ve tam olarak aşağıdaki JSON formatında yanıt ver. Başka hiçbir açıklama yazma.
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

    // Markdown temizliği (varsa ```json bloklarını kaldırır)
    const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

    return NextResponse.json(JSON.parse(cleanedText));
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message || 'İçerik üretilemedi' }, { status: 500 });
  }
}
